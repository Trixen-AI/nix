// Dashboard configuration. Every value comes from Vite env (see .env.example).

export const REOWN_PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID?.trim() ?? '';

export type Cluster = 'mainnet' | 'devnet';

// CAIP-2 references for the Solana genesis hashes (what AppKit reports as chainId).
export const CLUSTER_REF: Record<Cluster, string> = {
  mainnet: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  devnet: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
};

export const CLUSTER_LABEL: Record<Cluster, string> = {
  mainnet: 'Solana Mainnet',
  devnet: 'Solana Devnet',
};

export function clusterFromChainId(chainId: string | number | undefined): Cluster {
  return String(chainId ?? '').includes(CLUSTER_REF.devnet) ? 'devnet' : 'mainnet';
}

const CUSTOM_RPC: Record<Cluster, string> = {
  mainnet: import.meta.env.VITE_SOLANA_RPC_URL?.trim() ?? '',
  devnet: import.meta.env.VITE_SOLANA_DEVNET_RPC_URL?.trim() ?? '',
};

/** Custom RPC if configured, otherwise Reown's Solana RPC. The public mainnet endpoint rejects browser requests. */
export function rpcUrl(cluster: Cluster): string {
  if (CUSTOM_RPC[cluster]) return CUSTOM_RPC[cluster];
  if (REOWN_PROJECT_ID) {
    return `https://rpc.walletconnect.org/v1/?chainId=solana:${CLUSTER_REF[cluster]}&projectId=${REOWN_PROJECT_ID}`;
  }
  return cluster === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';
}

/** True when no dedicated RPC is set. Shared nodes often keep only recent history, so older transactions can be missing. */
export const usingSharedRpc = (cluster: Cluster) => !CUSTOM_RPC[cluster];

export const explorerTx = (sig: string, cluster: Cluster) =>
  `https://solscan.io/tx/${sig}${cluster === 'devnet' ? '?cluster=devnet' : ''}`;
export const explorerAccount = (addr: string, cluster: Cluster) =>
  `https://solscan.io/account/${addr}${cluster === 'devnet' ? '?cluster=devnet' : ''}`;

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const LAMPORTS = 1_000_000_000;
/** SOL kept back when using "Max", so the wallet can still pay fees. */
export const SOL_FEE_RESERVE = 0.01;
/** How many recent transactions the exposure report reads. */
export const EXPOSURE_WINDOW = 100;

export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// Programs we can name in activity and exposure reports. Anything else shows as a short address.
export const KNOWN_PROGRAMS: Record<string, string> = {
  '11111111111111111111111111111111': 'System',
  [TOKEN_PROGRAM]: 'SPL Token',
  [TOKEN_2022_PROGRAM]: 'Token-2022',
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: 'Associated Token',
  ComputeBudget111111111111111111111111111111: 'Compute Budget',
  MemoSq4gqABAXKb96qTH8TTZ9dtrenzu5Py6pSPhbYz: 'Memo',
  Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: 'Memo (v1)',
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: 'Jupiter',
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM',
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: 'Orca Whirlpools',
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'Pump.fun',
  Stake11111111111111111111111111111111111111: 'Stake',
  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: 'Token Metadata',
  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: 'Marinade',
};

/** Programs that only move plumbing (fees, account setup). They say nothing about who you deal with. */
export const PLUMBING_PROGRAMS = new Set([
  'ComputeBudget111111111111111111111111111111',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
]);

export const MEMO_PROGRAMS = new Set(['MemoSq4gqABAXKb96qTH8TTZ9dtrenzu5Py6pSPhbYz', 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo']);
