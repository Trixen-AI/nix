import {
  Connection,
  PublicKey,
  type ConfirmedSignatureInfo,
  type ParsedAccountData,
  type ParsedTransactionWithMeta,
  type PerfSample,
  type TokenBalance,
} from '@solana/web3.js';
import {
  LAMPORTS,
  MEMO_PROGRAMS,
  SOL_MINT,
  TOKEN_2022_PROGRAM,
  TOKEN_PROGRAM,
  rpcUrl,
  type Cluster,
} from '@/app/config';

const connections = new Map<Cluster, Connection>();

export function getConnection(cluster: Cluster): Connection {
  let c = connections.get(cluster);
  if (!c) {
    c = new Connection(rpcUrl(cluster), 'confirmed');
    connections.set(cluster, c);
  }
  return c;
}

export function toPublicKey(value: string): PublicKey | null {
  try {
    return new PublicKey(value.trim());
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- Holdings */

export type Holding = { mint: string; amount: number; decimals: number; program: 'spl' | 'token-2022' };
export type Holdings = { sol: number; tokens: Holding[]; nftCount: number; emptyAccounts: number };

type ParsedTokenInfo = { mint: string; tokenAmount: { amount: string; decimals: number; uiAmountString?: string } };

export async function fetchHoldings(conn: Connection, owner: string): Promise<Holdings> {
  const pk = new PublicKey(owner);
  const [lamports, spl, t22] = await Promise.all([
    conn.getBalance(pk),
    conn.getParsedTokenAccountsByOwner(pk, { programId: new PublicKey(TOKEN_PROGRAM) }),
    // Token-2022 is not on every RPC plan; an empty list is the honest fallback.
    conn.getParsedTokenAccountsByOwner(pk, { programId: new PublicKey(TOKEN_2022_PROGRAM) }).catch(() => ({ value: [] })),
  ]);

  const byMint = new Map<string, Holding>();
  let nftCount = 0;
  let emptyAccounts = 0;
  const add = (accounts: typeof spl.value, program: Holding['program']) => {
    for (const { account } of accounts) {
      const info = (account.data as ParsedAccountData).parsed?.info as ParsedTokenInfo | undefined;
      if (!info) continue;
      const { amount, decimals } = info.tokenAmount;
      const ui = Number(amount) / 10 ** decimals;
      if (ui === 0) {
        emptyAccounts += 1;
        continue;
      }
      if (decimals === 0 && amount === '1') {
        nftCount += 1;
        continue;
      }
      const prev = byMint.get(info.mint);
      if (prev) prev.amount += ui;
      else byMint.set(info.mint, { mint: info.mint, amount: ui, decimals, program });
    }
  };
  add(spl.value, 'spl');
  add(t22.value, 'token-2022');

  return { sol: lamports / LAMPORTS, tokens: [...byMint.values()], nftCount, emptyAccounts };
}

/* ---------------------------------------------------------------- Activity */

export type AssetChange = { asset: string; delta: number };
export type TxKind = 'send' | 'receive' | 'swap' | 'other' | 'failed';

export type TxSummary = {
  signature: string;
  slot: number;
  blockTime: number | null;
  failed: boolean;
  kind: TxKind;
  /** Fee in SOL, only when this wallet paid it. */
  fee: number;
  /** Net changes for this wallet, fees excluded. `asset` is 'SOL' or a token mint. */
  changes: AssetChange[];
  /** Addresses whose balance moved the opposite way to yours: the other side of the transfer. */
  counterparties: string[];
  /** Every program the transaction invoked, outer and inner. */
  programs: string[];
  memo: string | null;
  /** False when another wallet's transaction only referenced this one. */
  signer: boolean;
};

const DUST_SOL = 0.000_01;

function tokenDeltas(pre: TokenBalance[] = [], post: TokenBalance[] = []) {
  // Delta per token account, keyed by account index (an account can be missing before creation or after closing).
  const rows = new Map<number, { mint: string; owner?: string; delta: number }>();
  const amt = (b: TokenBalance) => Number(b.uiTokenAmount.amount) / 10 ** b.uiTokenAmount.decimals;
  for (const b of pre) rows.set(b.accountIndex, { mint: b.mint, owner: b.owner, delta: -amt(b) });
  for (const b of post) {
    const r = rows.get(b.accountIndex);
    if (r) r.delta += amt(b);
    else rows.set(b.accountIndex, { mint: b.mint, owner: b.owner, delta: amt(b) });
  }
  return [...rows.values()];
}

function cleanMemo(memo: string | null | undefined): string | null {
  if (!memo) return null;
  return memo.replace(/^\[\d+\]\s*/, '').trim() || null;
}

export function summarizeTx(tx: ParsedTransactionWithMeta | null, info: ConfirmedSignatureInfo, owner: string): TxSummary {
  const base: TxSummary = {
    signature: info.signature,
    slot: info.slot,
    blockTime: info.blockTime ?? null,
    failed: info.err != null,
    kind: info.err != null ? 'failed' : 'other',
    fee: 0,
    changes: [],
    counterparties: [],
    programs: [],
    memo: cleanMemo(info.memo),
    signer: true,
  };
  if (!tx?.meta) return base;

  const { meta } = tx;
  const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
  const programs = new Set<string>();
  for (const ix of tx.transaction.message.instructions) programs.add(ix.programId.toBase58());
  for (const inner of meta.innerInstructions ?? []) for (const ix of inner.instructions) programs.add(ix.programId.toBase58());
  base.programs = [...programs];
  if (!base.memo && base.programs.some((p) => MEMO_PROGRAMS.has(p))) base.memo = '(memo attached)';

  const idx = keys.indexOf(owner);
  base.signer = idx >= 0 && tx.transaction.message.accountKeys[idx].signer;
  const paidFee = idx === 0;
  base.fee = paidFee ? meta.fee / LAMPORTS : 0;

  // SOL change, fee excluded, so a plain transfer shows the amount actually sent.
  let solDelta = 0;
  if (idx >= 0) solDelta = (meta.postBalances[idx] - meta.preBalances[idx] + (paidFee ? meta.fee : 0)) / LAMPORTS;

  // Token changes for this wallet. Wrapped SOL is left out: its lamports already show up in the SOL change.
  const tokenRows = tokenDeltas(meta.preTokenBalances ?? [], meta.postTokenBalances ?? []);
  const mine = new Map<string, number>();
  for (const r of tokenRows) {
    if (r.owner !== owner || r.mint === SOL_MINT) continue;
    mine.set(r.mint, (mine.get(r.mint) ?? 0) + r.delta);
  }

  const changes: AssetChange[] = [];
  if (Math.abs(solDelta) >= DUST_SOL) changes.push({ asset: 'SOL', delta: solDelta });
  for (const [mint, delta] of mine) if (Math.abs(delta) > 0) changes.push({ asset: mint, delta });
  base.changes = changes;

  const counterparties = new Set<string>();
  // Token counterparties: owners whose balance of the same mint moved the other way.
  for (const r of tokenRows) {
    const myDelta = mine.get(r.mint);
    if (!myDelta || !r.owner || r.owner === owner) continue;
    if (Math.sign(r.delta) === -Math.sign(myDelta)) counterparties.add(r.owner);
  }
  // SOL counterparties only for pure SOL transfers, so token-account rent does not show up as a person.
  if (mine.size === 0 && Math.abs(solDelta) >= DUST_SOL) {
    const tokenAccounts = new Set([...(meta.preTokenBalances ?? []), ...(meta.postTokenBalances ?? [])].map((b) => keys[b.accountIndex]));
    keys.forEach((k, i) => {
      if (i === idx || programs.has(k) || tokenAccounts.has(k)) return;
      const d = (meta.postBalances[i] - meta.preBalances[i] + (i === 0 ? meta.fee : 0)) / LAMPORTS;
      if (Math.abs(d) >= DUST_SOL && Math.sign(d) === -Math.sign(solDelta)) counterparties.add(k);
    });
  }
  base.counterparties = [...counterparties];

  if (!base.failed) {
    const out = changes.some((c) => c.delta < 0);
    const inc = changes.some((c) => c.delta > 0);
    base.kind = out && inc ? 'swap' : out ? 'send' : inc ? 'receive' : 'other';
  }
  return base;
}

const PARSE_CONCURRENCY = 6;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getParsedWithRetry(conn: Connection, sig: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await conn.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    } catch (e) {
      if (attempt === 2) throw e;
      await sleep(400 * (attempt + 1));
    }
  }
  return null;
}

/**
 * One request per transaction with a small worker pool. Reown's RPC (and most free plans) reject batched
 * getTransaction calls, and a few parallel workers keep 100 lookups to a couple of seconds.
 */
async function fetchParsed(conn: Connection, sigs: string[]) {
  const out: (ParsedTransactionWithMeta | null)[] = new Array(sigs.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < sigs.length) {
      const i = next++;
      out[i] = await getParsedWithRetry(conn, sigs[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARSE_CONCURRENCY, sigs.length) }, worker));
  return out;
}

export type ActivityPage = { items: TxSummary[]; nextBefore: string | null };

export async function fetchActivityPage(conn: Connection, owner: string, limit: number, before?: string): Promise<ActivityPage> {
  const infos = await conn.getSignaturesForAddress(new PublicKey(owner), { limit, before });
  if (infos.length === 0) return { items: [], nextBefore: null };
  const txs = await fetchParsed(conn, infos.map((i) => i.signature));
  return {
    items: infos.map((info, i) => summarizeTx(txs[i], info, owner)),
    nextBefore: infos.length === limit ? infos[infos.length - 1].signature : null,
  };
}

/* ---------------------------------------------------------------- Network */

export type NetworkStats = {
  slot: number;
  blockHeight: number;
  epoch: number;
  epochProgress: number;
  epochSlotsLeft: number;
  tps: number;
  userTps: number;
  userTpsAvg: number;
  slotMs: number;
  /** Priority fee in micro-lamports per compute unit. */
  priorityMedian: number;
  priorityP75: number;
  version: string;
  samples: { t: number; userTps: number }[];
};

const quantile = (sorted: number[], q: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0);

export async function fetchNetworkStats(conn: Connection): Promise<NetworkStats> {
  const [slot, epoch, perf, fees, version] = await Promise.all([
    conn.getSlot(),
    conn.getEpochInfo(),
    conn.getRecentPerformanceSamples(30),
    conn.getRecentPrioritizationFees(),
    conn.getVersion(),
  ]);
  // The RPC also returns numNonVoteTransactions (user traffic); web3.js's type does not list it.
  const rate = (s: PerfSample & { numNonVoteTransactions?: number | null }) => ({
    all: s.numTransactions / s.samplePeriodSecs,
    user: (s.numNonVoteTransactions ?? s.numTransactions) / s.samplePeriodSecs,
  });
  const latest = perf[0] ? rate(perf[0]) : { all: 0, user: 0 };
  const userAvg = perf.length ? perf.reduce((a, s) => a + rate(s).user, 0) / perf.length : 0;
  const sortedFees = fees.map((f) => f.prioritizationFee).sort((a, b) => a - b);
  return {
    slot,
    blockHeight: epoch.blockHeight ?? 0,
    epoch: epoch.epoch,
    epochProgress: epoch.slotIndex / epoch.slotsInEpoch,
    epochSlotsLeft: epoch.slotsInEpoch - epoch.slotIndex,
    tps: latest.all,
    userTps: latest.user,
    userTpsAvg: userAvg,
    slotMs: perf[0] && perf[0].numSlots ? (perf[0].samplePeriodSecs * 1000) / perf[0].numSlots : 400,
    priorityMedian: quantile(sortedFees, 0.5),
    priorityP75: quantile(sortedFees, 0.75),
    version: version['solana-core'],
    samples: perf
      .map((s) => ({ t: s.slot, userTps: rate(s).user }))
      .reverse(),
  };
}

/** Network fee for one hop: base signature fee plus priority at the median rate for a typical 200k CU transfer. */
export function hopFeeSol(stats: Pick<NetworkStats, 'priorityMedian'> | undefined): number {
  const base = 5000;
  const priority = stats ? (stats.priorityMedian * 200_000) / 1_000_000 : 0;
  return (base + priority) / LAMPORTS;
}
