import { CLUSTER_LABEL, rpcUrl, type Cluster } from '@/app/config';
import { useNetwork, useWallet } from '@/app/hooks';
import { crowdOf } from '@/app/lib/agent';
import { fmtInt } from '@/app/lib/format';
import type { NetworkStats } from '@/app/lib/solana';
import { ErrorNote, Meter, PageHead, Panel, Pill, Skeleton, Stat } from '@/app/ui';

function rpcLabel(cluster: Cluster) {
  const host = new URL(rpcUrl(cluster)).host;
  return host === 'rpc.walletconnect.org' ? 'Reown RPC' : host;
}

export default function Network() {
  const { cluster } = useWallet();
  const { data, isLoading, error, refetch, dataUpdatedAt } = useNetwork(cluster);
  const crowd = crowdOf(data);

  return (
    <>
      <title>Network | ZKSona</title>
      <PageHead
        eyebrow="#07 / network"
        title={`${CLUSTER_LABEL[cluster]}, live`}
        body="Load and fees, refreshed every 20 seconds. Busier minutes mean more company for a private transfer."
      />
      {isLoading ? (
        <Panel>
          <Skeleton lines={5} />
        </Panel>
      ) : error ? (
        <ErrorNote error={error} onRetry={() => refetch()} />
      ) : data ? (
        <div className="dx-grid">
          <Panel tone="frame" className="span-12">
            <div className="dx-stats">
              <Stat label="User transactions / s" value={fmtInt(data.userTps)} sub={`All incl. votes ${fmtInt(data.tps)}`} />
              <Stat label="Slot time" value={`${Math.round(data.slotMs)} ms`} sub={`Slot ${fmtInt(data.slot)}`} />
              <Stat label="Min. priority fee to land" value={`${fmtInt(data.priorityMedian)} µL/CU`} sub={`p75 ${fmtInt(data.priorityP75)} µL/CU`} />
              <Stat label={`Epoch ${data.epoch}`} value={`${Math.round(data.epochProgress * 100)}%`} sub={<Meter value={data.epochProgress} />} />
            </div>
          </Panel>

          <Panel className="span-8" eyebrow="Last 30 minutes" title="User transactions per second">
            <Sparkline stats={data} />
            <p className="p-small muted">
              One point per minute from the cluster's performance samples. Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-US')}.
            </p>
          </Panel>

          <Panel tone="dark" className="span-4 dx-agent" eyebrow="Crowd" title={crowd ? `${crowd.label} right now` : 'Crowd'}>
            {crowd ? (
              <>
                <p className="p">{crowd.detail}</p>
                <Meter value={Math.min(crowd.ratio, 1.5)} max={1.5} />
                <p className="p-small dx-dim">
                  {crowd.label === 'Quiet'
                    ? 'Ghost tier adds a randomised delay, which helps most when traffic is thin.'
                    : 'Standard and Enhanced settle fastest while traffic is high.'}
                </p>
              </>
            ) : null}
          </Panel>

          <ProtocolPanel />

          <Panel className="span-5" eyebrow="Connection" title="Where this data comes from">
            <dl className="dx-kv is-light">
              <div>
                <dt>RPC</dt>
                <dd>{rpcLabel(cluster)}</dd>
              </div>
              <div>
                <dt>Node version</dt>
                <dd>{data.version}</dd>
              </div>
              <div>
                <dt>Block height</dt>
                <dd>{fmtInt(data.blockHeight)}</dd>
              </div>
              <div>
                <dt>Epoch slots left</dt>
                <dd>{fmtInt(data.epochSlotsLeft)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      ) : null}
    </>
  );
}

function Sparkline({ stats }: { stats: NetworkStats }) {
  const pts = stats.samples;
  if (pts.length < 2) return <p className="p-small muted">Not enough samples yet.</p>;
  const w = 600;
  const h = 160;
  const vals = pts.map((p) => p.userTps);
  const min = Math.min(...vals) * 0.95;
  const max = Math.max(...vals) * 1.05;
  const x = (i: number) => (i / (pts.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * h;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.userTps).toFixed(1)}`).join('');
  const avgY = y(stats.userTpsAvg);
  return (
    <svg className="dx-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={`User transactions per second, now ${fmtInt(stats.userTps)}`}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${w} ${h}L0 ${h}Z`} fill="url(#spark-fill)" />
      <line x1="0" x2={w} y1={avgY} y2={avgY} stroke="var(--ink-36)" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ProtocolPanel() {
  const modules = [
    { name: 'Exposure scan', state: 'Live', tone: 'ok' as const, detail: 'Reads public history straight from the cluster.' },
    { name: 'Network watch', state: 'Live', tone: 'ok' as const, detail: 'Load, fees and crowd size, every 20 seconds.' },
    { name: 'Private TX and mixer relayers', state: 'Approve', tone: 'accent' as const, detail: 'Build a private transfer from your balances and approve it with your wallet.' },
    { name: 'Shield Vault', state: 'Approve', tone: 'accent' as const, detail: 'Pick an asset and a release date, then approve the lock.' },
    { name: 'Bridge onto Solana', state: 'Approve', tone: 'accent' as const, detail: 'Bring assets onto Solana into a shielded pool.' },
  ];
  return (
    <Panel className="span-7" eyebrow="Protocol" title="ZKSona status">
      <ul className="dx-modules is-status">
        {modules.map((m) => (
          <li key={m.name}>
            <div>
              <p>{m.name}</p>
              <p className="p-small muted">{m.detail}</p>
            </div>
            <Pill tone={m.tone}>{m.state}</Pill>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
