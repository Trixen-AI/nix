import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CLUSTER_LABEL, SOL_FEE_RESERVE, SOL_MINT } from '@/app/config';
import { signError, useExposure, useNetwork, usePortfolio, useSignMessage, useWallet, type AssetRow } from '@/app/hooks';
import { advise } from '@/app/lib/agent';
import { approvalMessage, toHex, useApprovals } from '@/app/lib/approvals';
import type { Tier } from '@/app/lib/exposure';
import { fmtAmount, fmtUsd, shortAddr } from '@/app/lib/format';
import { hopFeeSol, toPublicKey } from '@/app/lib/solana';
import { ApprovalsPanel, ConnectPrompt } from '@/app/shared';
import { PageHead, Panel, Pill, Skeleton, TokenMark } from '@/app/ui';
import { TIERS } from '@/data/content';
import { Icon } from '@/components/ui/Icon';

type Check = { ok: boolean; warn?: boolean; text: string };

const TIER_NAMES: Tier[] = ['Standard', 'Enhanced', 'Ghost'];
const tierCard = (t: Tier) => TIERS.cards.find((c) => c.label === t)!;
const parseTier = (v: string | null): Tier | null => TIER_NAMES.find((t) => t.toLowerCase() === v?.toLowerCase()) ?? null;

export default function PrivateTx() {
  const { address, cluster } = useWallet();
  return (
    <>
      <title>Private TX | Zentry</title>
      <PageHead
        eyebrow="/// transact"
        title="Private transaction"
        body="Pick an asset, a destination and how quiet you want to be. Balances and fees below are read live from your wallet and the network."
      />
      {address ? <Composer key={`${cluster}:${address}`} address={address} /> : <ConnectPrompt what="Connect to build a private transaction from your real balances." />}
    </>
  );
}

function Composer({ address }: { address: string }) {
  const { cluster } = useWallet();
  const [params, setParams] = useSearchParams();
  const portfolio = usePortfolio(address, cluster);
  const exposure = useExposure(address, cluster, portfolio.totalUsd, (portfolio.holdings?.sol ?? 0) > 0);
  const network = useNetwork(cluster);
  const advice = advise(exposure.report, network.data);

  const [assetMint, setAssetMint] = useState(params.get('asset') ?? SOL_MINT);
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState(params.get('to') ?? '');
  const tier: Tier = parseTier(params.get('tier')) ?? advice?.tier ?? 'Enhanced';
  const card = tierCard(tier);
  const sign = useSignMessage();
  const approvals = useApprovals(address, cluster, 'private-tx');
  const [status, setStatus] = useState<{ state: 'idle' | 'signing' | 'done' | 'error'; msg?: string }>({ state: 'idle' });

  const setTier = (t: Tier) =>
    setParams(
      (p) => {
        p.set('tier', t.toLowerCase());
        return p;
      },
      { replace: true },
    );

  const asset: AssetRow | undefined = portfolio.rows.find((r) => r.mint === assetMint) ?? portfolio.rows[0];
  const hops = card.mock.hops;
  const feeSol = hops * hopFeeSol(network.data);
  const solPrice = portfolio.rows[0]?.price ?? null;
  const available = asset ? (asset.isSol ? Math.max(0, asset.amount - SOL_FEE_RESERVE - feeSol) : asset.amount) : 0;

  // Derived validation, no effects needed.
  const n = Number(amount);
  const amountOk = amount !== '' && Number.isFinite(n) && n > 0 && n <= available;
  const destPk = to.trim() ? toPublicKey(to) : null;
  const destOk = Boolean(destPk) && destPk!.toBase58() !== address;
  const offCurve = destPk ? !PublicKey.isOnCurve(destPk.toBytes()) : false;
  const priorLinks = destPk ? exposure.report?.counterparties.find((c) => c.address === destPk.toBase58())?.count ?? 0 : 0;
  const solForFees = (portfolio.holdings?.sol ?? 0) >= feeSol + (asset?.isSol ? n || 0 : 0);

  const checks: Check[] = [
    { ok: amountOk, text: amount === '' ? 'Enter an amount' : amountOk ? `${fmtAmount(n)} of ${fmtAmount(available)} ${asset?.symbol} available` : `More than your available ${fmtAmount(available)} ${asset?.symbol}` },
    {
      ok: destOk,
      text: !to.trim() ? 'Enter a destination address' : !destPk ? 'Not a valid Solana address' : destPk.toBase58() === address ? 'That is your own address' : `Destination ${shortAddr(destPk.toBase58())}`,
    },
    {
      ok: Boolean(portfolio.holdings) && solForFees,
      text: !portfolio.holdings ? 'Reading your SOL balance...' : solForFees ? 'Enough SOL for network fees' : 'Not enough SOL left for network fees',
    },
  ];
  if (offCurve) checks.push({ ok: true, warn: true, text: 'Destination is a program-derived address. Make sure it can receive funds.' });
  if (priorLinks > 0)
    checks.push({
      ok: true,
      warn: true,
      text: `You have already transacted with this address ${priorLinks} time${priorLinks === 1 ? '' : 's'} in public. That link exists onchain already.`,
    });

  const ready = checks.every((c) => c.ok);

  const approve = async () => {
    if (!ready || !asset || !destPk) return;
    const dest = destPk.toBase58();
    const summary = `${fmtAmount(n)} ${asset.symbol} to ${shortAddr(dest)}, ${tier}`;
    const message = approvalMessage(
      [
        ['Wallet', address],
        ['Send', `${fmtAmount(n)} ${asset.symbol}`],
        ['Asset', asset.isSol ? 'SOL (native)' : asset.mint],
        ['To', dest],
        ['Tier', `${tier} (${card.title})`],
        ['Cluster', CLUSTER_LABEL[cluster]],
      ],
      'Zentry private transfer approval',
    );
    setStatus({ state: 'signing' });
    try {
      const sig = await sign(message);
      approvals.add({ summary, signature: toHex(sig), message });
      setStatus({ state: 'done', msg: `Approved: ${summary}.` });
      setAmount('');
    } catch (e) {
      setStatus({ state: 'error', msg: signError(e) });
    }
  };

  return (
    <div className="dx-grid">
      <div className="span-7 dx-col">
        <Panel eyebrow="Step 1" title="Asset and amount">
          {portfolio.isLoading ? (
            <Skeleton lines={3} />
          ) : (
            <>
              <div className="dx-assets-pick" role="radiogroup" aria-label="Asset">
                {portfolio.rows.slice(0, 8).map((r) => (
                  <button
                    type="button"
                    key={r.mint}
                    role="radio"
                    aria-checked={asset?.mint === r.mint}
                    className={`dx-chip${asset?.mint === r.mint ? ' is-on' : ''}`}
                    onClick={() => setAssetMint(r.mint)}
                  >
                    <TokenMark symbol={r.symbol} isSol={r.isSol} size={20} />
                    {r.symbol}
                  </button>
                ))}
              </div>
              <label className="field">
                Amount
                <div className="dx-input-row">
                  <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} aria-invalid={amount !== '' && !amountOk} />
                  <button type="button" className="btn btn-ghost" onClick={() => setAmount(String(Number(available.toFixed(Math.min(asset?.decimals ?? 9, 6)))))}>
                    Max
                  </button>
                </div>
              </label>
              <p className="p-small muted">
                Available {fmtAmount(available)} {asset?.symbol}
                {asset?.isSol ? ` (keeps ${SOL_FEE_RESERVE} SOL for fees)` : ''}
                {asset?.price != null && amountOk ? ` · about ${fmtUsd(n * asset.price)}` : ''}
              </p>
            </>
          )}
        </Panel>

        <Panel eyebrow="Step 2" title="Destination">
          <label className="field">
            Solana address
            <input placeholder="Recipient address" value={to} onChange={(e) => setTo(e.target.value)} spellCheck={false} autoComplete="off" aria-invalid={Boolean(to.trim()) && !destOk} />
          </label>
          <p className="p-small muted">Checked against your own public history, so you can see if a link already exists.</p>
        </Panel>

        <Panel eyebrow="Step 3" title="Privacy tier">
          <div className="dx-tiers" role="radiogroup" aria-label="Privacy tier">
            {TIER_NAMES.map((t) => {
              const c = tierCard(t);
              return (
                <button type="button" role="radio" aria-checked={tier === t} key={t} className={`dx-tier${tier === t ? ' is-on' : ''}`} onClick={() => setTier(t)}>
                  <span className="dx-tier-top">
                    <span className="card-label">{t}</span>
                    {advice?.tier === t ? <Pill tone="accent">Agent pick</Pill> : null}
                  </span>
                  <span className="h4">{c.title}</span>
                  <span className="dx-hops" aria-hidden="true">
                    {Array.from({ length: 10 }, (_, i) => (
                      <i key={i} className={i < c.mock.hops ? 'on' : ''} />
                    ))}
                  </span>
                  <span className="p-small muted">{c.body}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="span-5 dx-col dx-sticky">
        <Panel tone="dark" eyebrow="Review" title={`${tier} · ${hops} hops${card.mock.zk ? ' + zk' : ''}`}>
          <dl className="dx-kv">
            <div>
              <dt>Send</dt>
              <dd>{amountOk ? `${fmtAmount(n)} ${asset?.symbol}` : 'n/a'}</dd>
            </div>
            <div>
              <dt>To</dt>
              <dd>{destOk ? shortAddr(destPk!.toBase58()) : 'n/a'}</dd>
            </div>
            <div>
              <dt>Settles in</dt>
              <dd>{card.mock.time}</dd>
            </div>
            <div>
              <dt>Network fees ({hops} hops)</dt>
              <dd>
                {fmtAmount(feeSol, 6)} SOL{solPrice != null ? ` · ${fmtUsd(feeSol * solPrice)}` : ''}
              </dd>
            </div>
            <div>
              <dt>Proof</dt>
              <dd>{card.mock.zk ? 'zk-SNARK, made on your device' : 'None'}</dd>
            </div>
          </dl>
          <ul className="dx-checks">
            {checks.map((c) => (
              <li key={c.text} className={c.warn ? 'is-warn' : c.ok ? 'is-ok' : 'is-bad'}>
                <Icon name={c.warn ? 'alert' : c.ok ? 'check' : 'close'} />
                {c.text}
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-accent dx-wide" disabled={!ready || status.state === 'signing'} onClick={approve}>
            {status.state === 'signing' ? 'Waiting for your wallet...' : ready ? 'Approve' : 'Complete the steps above'}
          </button>
          {status.msg ? (
            <p className={`dx-status is-${status.state}`} role="status">
              <Icon name={status.state === 'done' ? 'check' : 'alert'} />
              {status.msg}
            </p>
          ) : null}
          <p className="p-small dx-dim">Fee estimate: base fee plus the live median priority fee for each hop.</p>
        </Panel>
      </div>

      <ApprovalsPanel title="Approved private transfers" items={approvals.items} onClear={approvals.clear} />
    </div>
  );
}
