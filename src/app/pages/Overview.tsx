import { useState } from 'react';
import { Link } from 'react-router';
import { ActivityRow } from '@/app/activity';
import { useLinkCounts } from '@/app/lib/activity';
import { CLUSTER_LABEL, EXPOSURE_WINDOW, usingSharedRpc } from '@/app/config';
import { useExposure, useNetwork, usePortfolio, useTokenMeta, useWallet } from '@/app/hooks';
import { advise, crowdOf } from '@/app/lib/agent';
import { fmtAmount, fmtInt, fmtUsd } from '@/app/lib/format';
import { ConnectPrompt } from '@/app/shared';
import { Address, Empty, ErrorNote, Meter, PageHead, Panel, Pill, ScoreRing, Skeleton, Stat } from '@/app/ui';
import { Icon } from '@/components/ui/Icon';

export default function Overview() {
  const { address, cluster } = useWallet();
  return (
    <>
      <title>Overview | Zentry</title>
      <PageHead
        eyebrow="/// dashboard"
        title="Overview"
        body={`Your wallet as the chain sees it on ${CLUSTER_LABEL[cluster]}, and what Zentry would change.`}
        actions={
          <Link className="btn btn-dark" to="/app/private-tx">
            New private TX
          </Link>
        }
      />
      {address ? <Connected address={address} /> : <ConnectPrompt what="Connect to see your balances, what your history exposes and the tier the privacy agent suggests." />}
      <NetworkStrip />
    </>
  );
}

function Connected({ address }: { address: string }) {
  const { cluster } = useWallet();
  const portfolio = usePortfolio(address, cluster);
  const exposure = useExposure(address, cluster, portfolio.totalUsd, (portfolio.holdings?.sol ?? 0) > 0);
  const network = useNetwork(cluster);
  const advice = advise(exposure.report, network.data);
  const recent = exposure.items?.slice(0, 6) ?? [];
  const meta = useTokenMeta(recent.flatMap((t) => t.changes.map((c) => c.asset)).filter((a) => a !== 'SOL'), cluster);
  const linkCounts = useLinkCounts(exposure.items ?? []);
  const [now] = useState(Date.now);

  return (
    <div className="dx-grid">
      <Panel tone="frame" className="span-5 dx-balance">
        <p className="eyebrow">Public balance</p>
        {portfolio.isLoading ? (
          <Skeleton lines={2} />
        ) : portfolio.error ? (
          <ErrorNote error={portfolio.error} onRetry={() => portfolio.refetch()} />
        ) : (
          <>
            <p className="dx-balance-value">
              {cluster === 'mainnet' ? fmtUsd(portfolio.totalUsd) : `${fmtAmount(portfolio.holdings?.sol ?? 0, 4)} SOL`}
            </p>
            <p className="p muted">
              {cluster === 'mainnet'
                ? `${fmtAmount(portfolio.holdings?.sol ?? 0, 4)} SOL and ${portfolio.rows.length - 1} token${portfolio.rows.length === 2 ? '' : 's'}`
                : 'Devnet tokens carry no market value.'}
            </p>
          </>
        )}
        <div className="dx-balance-foot">
          <Address address={address} cluster={cluster} />
          <Link to="/app/assets" className="dx-link">
            Assets <Icon name="arrowRight" />
          </Link>
        </div>
      </Panel>

      <Panel className="span-3 dx-score-card" eyebrow="Exposure" title="What your history gives away">
        {exposure.isLoading ? (
          <Skeleton lines={3} />
        ) : exposure.error ? (
          <ErrorNote error={exposure.error} onRetry={() => exposure.refetch()} />
        ) : exposure.report ? (
          <>
            <div className="dx-score-row">
              <ScoreRing score={exposure.report.score} size={112} />
              <div>
                <Pill tone={exposure.report.level === 'Low' ? 'ok' : exposure.report.level === 'Moderate' ? 'warn' : 'high'}>{exposure.report.level}</Pill>
                <p className="p-small muted dx-score-note">
                  {exposure.report.analyzed === 1 ? 'From your last transaction.' : `From your last ${exposure.report.analyzed} transactions.`}
                </p>
              </div>
            </div>
            {exposure.report.analyzed < EXPOSURE_WINDOW && usingSharedRpc(cluster) ? (
              <p className="p-small muted">The shared RPC may be returning only recent history, so this score can read low.</p>
            ) : null}
            <Link to="/app/exposure" className="dx-link">
              Full report <Icon name="arrowRight" />
            </Link>
          </>
        ) : null}
      </Panel>

      <Panel tone="dark" className="span-4 dx-agent" eyebrow="Privacy agent" title={advice ? `Suggested tier: ${advice.tier}` : 'Reading your wallet...'}>
        {advice ? (
          <>
            <ul className="dx-reasons">
              {advice.reasons.slice(0, 3).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <Link className="btn btn-accent" to={`/app/private-tx?tier=${advice.tier.toLowerCase()}`}>
              Start with {advice.tier}
            </Link>
          </>
        ) : (
          <Skeleton lines={3} />
        )}
      </Panel>

      <Panel
        className="span-8"
        eyebrow="Activity"
        title="Recent transactions"
        action={
          <Link to="/app/activity" className="dx-link">
            All activity <Icon name="arrowRight" />
          </Link>
        }
      >
        {exposure.isLoading ? (
          <Skeleton lines={5} />
        ) : recent.length ? (
          <ul className="dx-txs">
            {recent.map((t) => (
              <ActivityRow key={t.signature} t={t} cluster={cluster} meta={meta.data} linkCounts={linkCounts} now={now} />
            ))}
          </ul>
        ) : (
          <Empty icon="list" title="No transactions yet" body={`This wallet has no history on ${CLUSTER_LABEL[cluster]}.`} />
        )}
      </Panel>

      <ModulesPanel />
    </div>
  );
}

function ModulesPanel() {
  const rows = [
    { label: 'Private TX', to: '/app/private-tx', icon: 'lock' as const, live: false },
    { label: 'Shield Vault', to: '/app/vault', icon: 'shield' as const, live: false },
    { label: 'Exposure scan', to: '/app/exposure', icon: 'eye' as const, live: true },
    { label: 'Network watch', to: '/app/network', icon: 'pulse' as const, live: true },
  ];
  return (
    <Panel className="span-4" eyebrow="Modules" title="What runs today">
      <ul className="dx-modules">
        {rows.map((r) => (
          <li key={r.label}>
            <Link to={r.to}>
              <span className="dd-icon">
                <Icon name={r.icon} />
              </span>
              {r.label}
              <Pill tone={r.live ? 'ok' : 'accent'}>{r.live ? 'Live' : 'Approve'}</Pill>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function NetworkStrip() {
  const { cluster } = useWallet();
  const { data, isLoading, error, refetch } = useNetwork(cluster);
  const crowd = crowdOf(data);
  return (
    <Panel
      className="dx-strip"
      eyebrow={`${CLUSTER_LABEL[cluster]} · live`}
      action={
        <Link to="/app/network" className="dx-link">
          Network <Icon name="arrowRight" />
        </Link>
      }
    >
      {isLoading ? (
        <Skeleton lines={2} />
      ) : error ? (
        <ErrorNote error={error} onRetry={() => refetch()} />
      ) : data ? (
        <div className="dx-stats">
          <Stat label="User transactions / s" value={fmtInt(data.userTps)} sub={`30-min avg ${fmtInt(data.userTpsAvg)}`} />
          <Stat label="Crowd right now" value={crowd?.label ?? 'n/a'} sub={<Meter value={Math.min(crowd?.ratio ?? 0, 1.5)} max={1.5} />} />
          <Stat label="Min. priority fee to land" value={`${fmtInt(data.priorityMedian)} µL/CU`} sub={`p75 ${fmtInt(data.priorityP75)}`} />
          <Stat label="Slot" value={fmtInt(data.slot)} sub={`Epoch ${data.epoch}, ${Math.round(data.epochProgress * 100)}% done`} />
        </div>
      ) : null}
    </Panel>
  );
}
