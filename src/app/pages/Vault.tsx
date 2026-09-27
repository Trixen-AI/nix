import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CLUSTER_LABEL, SOL_FEE_RESERVE, SOL_MINT } from '@/app/config';
import { signError, usePortfolio, useSignMessage, useWallet } from '@/app/hooks';
import { approvalMessage, toHex, useApprovals } from '@/app/lib/approvals';
import { fmtAmount, fmtUsd } from '@/app/lib/format';
import { ApprovalsPanel, ConnectPrompt } from '@/app/shared';
import { PageHead, Panel, Skeleton, TokenMark } from '@/app/ui';
import { Icon } from '@/components/ui/Icon';

const DAY = 86_400_000;
const PRESETS = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 182 },
  { label: '1 year', days: 365 },
];
const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export default function Vault() {
  const { address, cluster } = useWallet();
  return (
    <>
      <title>Shield Vault | ZKSona</title>
      <PageHead
        eyebrow="#03 / shield vault"
        title="Park it out of sight"
        body="Put assets you are not using behind a release date. The balance stays sealed until then, and only your key opens it."
      />
      {address ? <VaultBody key={`${cluster}:${address}`} address={address} /> : <ConnectPrompt what="Connect to set up a lock from what you actually hold." />}
    </>
  );
}

function VaultBody({ address }: { address: string }) {
  const { cluster } = useWallet();
  const portfolio = usePortfolio(address, cluster);
  const sign = useSignMessage();
  const approvals = useApprovals(address, cluster, 'vault');
  const [status, setStatus] = useState<{ state: 'idle' | 'signing' | 'done' | 'error'; msg?: string }>({ state: 'idle' });
  const [today] = useState(() => Date.now());
  const [params] = useSearchParams();
  const [mint, setMint] = useState(params.get('asset') ?? SOL_MINT);
  const [amount, setAmount] = useState('');
  const [until, setUntil] = useState(() => isoDate(today + 90 * DAY));

  const asset = portfolio.rows.find((r) => r.mint === mint) ?? portfolio.rows[0];
  const available = asset ? (asset.isSol ? Math.max(0, asset.amount - SOL_FEE_RESERVE) : asset.amount) : 0;
  const n = Number(amount);
  const amountOk = amount !== '' && Number.isFinite(n) && n > 0 && n <= available;
  const untilMs = Date.parse(`${until}T00:00:00Z`);
  const days = Number.isFinite(untilMs) ? Math.ceil((untilMs - today) / DAY) : 0;
  const dateOk = days >= 1 && days <= 365 * 5;
  const ready = amountOk && dateOk && Boolean(asset);

  const approve = async () => {
    if (!ready || !asset) return;
    const summary = `Lock ${fmtAmount(n)} ${asset.symbol} until ${until}`;
    const message = approvalMessage(
      [
        ['Wallet', address],
        ['Lock', `${fmtAmount(n)} ${asset.symbol}`],
        ['Asset', asset.isSol ? 'SOL (native)' : asset.mint],
        ['Release', `${until} (UTC), ${days} days`],
        ['Cluster', CLUSTER_LABEL[cluster]],
      ],
      'ZKSona Shield Vault lock approval',
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
        <Panel eyebrow="Lock" title="What to lock">
          {portfolio.isLoading ? (
            <Skeleton lines={3} />
          ) : (
            <>
              <div className="dx-assets-pick" role="radiogroup" aria-label="Asset">
                {portfolio.rows.slice(0, 8).map((r) => (
                  <button type="button" key={r.mint} role="radio" aria-checked={asset?.mint === r.mint} className={`dx-chip${asset?.mint === r.mint ? ' is-on' : ''}`} onClick={() => setMint(r.mint)}>
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
                {asset?.price != null && amountOk ? ` · about ${fmtUsd(n * asset.price)}` : ''}
              </p>
            </>
          )}
        </Panel>
        <Panel eyebrow="Release" title="Until when">
          <div className="dx-assets-pick">
            {PRESETS.map((p) => {
              const v = isoDate(today + p.days * DAY);
              return (
                <button type="button" key={p.label} className={`dx-chip${until === v ? ' is-on' : ''}`} onClick={() => setUntil(v)}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <label className="field">
            Release date (UTC)
            <input type="date" value={until} min={isoDate(today + DAY)} max={isoDate(today + 365 * 5 * DAY)} onChange={(e) => setUntil(e.target.value)} aria-invalid={!dateOk} />
          </label>
          <p className="p-small muted">Between tomorrow and five years out. Nobody, including you, can move the assets before this date.</p>
        </Panel>
      </div>

      <div className="span-5 dx-col dx-sticky">
        <Panel tone="dark" eyebrow="Review" title="Vault lock">
          <dl className="dx-kv">
            <div>
              <dt>Lock</dt>
              <dd>{amountOk ? `${fmtAmount(n)} ${asset?.symbol}` : 'n/a'}</dd>
            </div>
            <div>
              <dt>Release</dt>
              <dd>{dateOk ? `${until} (${days} days)` : 'Pick a valid date'}</dd>
            </div>
            <div>
              <dt>Visible onchain</dt>
              <dd>A commitment, not the amount</dd>
            </div>
          </dl>
          <button type="button" className="btn btn-accent dx-wide" disabled={!ready || status.state === 'signing'} onClick={approve}>
            {status.state === 'signing' ? 'Waiting for your wallet...' : ready ? 'Approve' : 'Complete the steps'}
          </button>
          {status.msg ? (
            <p className={`dx-status is-${status.state}`} role="status">
              <Icon name={status.state === 'done' ? 'check' : 'alert'} />
              {status.msg}
            </p>
          ) : null}
        </Panel>
      </div>

      <ApprovalsPanel title="Approved vault locks" items={approvals.items} onClear={approvals.clear} />
    </div>
  );
}
