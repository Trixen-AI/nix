import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CLUSTER_LABEL, EXPOSURE_WINDOW, KNOWN_PROGRAMS, PLUMBING_PROGRAMS, explorerTx, usingSharedRpc } from '@/app/config';
import { useExposure, useNetwork, usePortfolio, useWallet } from '@/app/hooks';
import { advise } from '@/app/lib/agent';
import type { ExposureReport } from '@/app/lib/exposure';
import { fmtAgo, fmtDateTime, pad2, shortAddr } from '@/app/lib/format';
import { toPublicKey } from '@/app/lib/solana';
import { ConnectPrompt } from '@/app/shared';
import { Address, Empty, ErrorNote, HistoryNote, Meter, PageHead, Panel, Pill, ScoreRing, Skeleton } from '@/app/ui';
import { Icon } from '@/components/ui/Icon';

export default function Exposure() {
  const { address: own, cluster } = useWallet();
  const [params, setParams] = useSearchParams();
  const scanned = params.get('address');
  const target = scanned && toPublicKey(scanned) ? toPublicKey(scanned)!.toBase58() : own;
  const isOwn = Boolean(target && target === own);

  return (
    <>
      <title>Exposure | ZKSona</title>
      <PageHead
        eyebrow="#04 / privacy agent"
        title="Read yourself like a stranger would"
        body={`Built from the last ${EXPOSURE_WINDOW} transactions on ${CLUSTER_LABEL[cluster]}: the same public record any explorer or analytics desk reads.`}
      />
      <ScanForm
        key={scanned ?? ''}
        current={scanned ?? ''}
        hasOwn={Boolean(own)}
        onScan={(a) => setParams({ address: a })}
        onReset={() => setParams({})}
      />
      {scanned && !toPublicKey(scanned) ? <p className="dx-note is-warn">That is not a valid Solana address.</p> : null}
      {target ? (
        <Report key={`${cluster}:${target}`} target={target} isOwn={isOwn} />
      ) : (
        <ConnectPrompt what="Connect to scan your own wallet, or paste any address above to see how much it gives away." />
      )}
    </>
  );
}

function ScanForm({ current, hasOwn, onScan, onReset }: { current: string; hasOwn: boolean; onScan: (a: string) => void; onReset: () => void }) {
  const [value, setValue] = useState(current);
  const valid = Boolean(toPublicKey(value));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onScan(value.trim());
  };
  return (
    <form className="dx-scan" onSubmit={submit}>
      <label className="sr-only" htmlFor="scan-address">
        Address to scan
      </label>
      <input id="scan-address" placeholder="Paste any Solana address to scan it" value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} autoComplete="off" />
      <button type="submit" className="btn btn-dark" disabled={!valid}>
        Scan
      </button>
      {current && hasOwn ? (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setValue('');
            onReset();
          }}
        >
          My wallet
        </button>
      ) : null}
    </form>
  );
}

function Report({ target, isOwn }: { target: string; isOwn: boolean }) {
  const { cluster } = useWallet();
  const portfolio = usePortfolio(target, cluster);
  const exposure = useExposure(target, cluster, portfolio.totalUsd, (portfolio.holdings?.sol ?? 0) > 0);
  const network = useNetwork(cluster);
  const report = exposure.report;
  const advice = advise(report, network.data);

  if (exposure.isLoading) {
    return (
      <div className="dx-grid">
        <Panel className="span-12">
          <Skeleton lines={4} />
          <p className="p-small muted">Reading up to {EXPOSURE_WINDOW} transactions. Large histories take a few seconds.</p>
        </Panel>
      </div>
    );
  }
  if (exposure.error) return <ErrorNote error={exposure.error} onRetry={() => exposure.refetch()} />;
  if (!report) return null;

  return (
    <div className="dx-grid">
      <Panel tone="frame" className="span-7 dx-score-hero">
        <ScoreRing score={report.score} size={150} />
        <div className="stack">
          <p className="eyebrow">{isOwn ? 'Your wallet' : 'Scanned address'}</p>
          <Address address={target} cluster={cluster} chars={6} />
          <p className="h4">
            Exposure is <strong>{report.level.toLowerCase()}</strong>
          </p>
          <p className="p muted">
            {report.analyzed
              ? `${report.analyzed} transactions read, from ${fmtDateTime(report.firstTime)} to ${fmtDateTime(report.lastTime)}.`
              : 'No transactions found for this address.'}
          </p>
          {report.analyzed < EXPOSURE_WINDOW && usingSharedRpc(cluster) ? <HistoryNote shown={report.analyzed} /> : null}
          <div className="dx-inline">
            <Pill tone={report.level === 'Low' ? 'ok' : report.level === 'Moderate' ? 'warn' : 'high'}>{report.level}</Pill>
            <button type="button" className="dx-link" onClick={() => exposure.refetch()} disabled={exposure.isFetching}>
              <Icon name="refresh" /> {exposure.isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </Panel>

      <Panel tone="dark" className="span-5 dx-agent" eyebrow="Privacy agent" title={advice ? `Suggested tier: ${advice.tier}` : 'Suggested tier'}>
        {advice ? (
          <ul className="dx-reasons">
            {advice.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}
        {isOwn && advice ? (
          <Link className="btn btn-accent" to={`/app/private-tx?tier=${advice.tier.toLowerCase()}`}>
            Move privately with {advice.tier}
          </Link>
        ) : !isOwn ? (
          <Link className="btn btn-accent" to={`/app/private-tx?to=${target}`}>
            Send to this address privately
          </Link>
        ) : null}
      </Panel>

      <Panel className="span-7" eyebrow="Signals" title="Where the exposure comes from">
        <ul className="dx-signals">
          {report.signals.map((s) => (
            <li key={s.key}>
              <div className="dx-signal-head">
                <span>{s.title}</span>
                <span className="dx-signal-pts">
                  {s.points}/{s.max}
                </span>
              </div>
              <Meter value={s.points} max={s.max} tone={s.level === 'ok' ? 'accent' : s.level} />
              <p className="p-small muted">{s.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <TimingPanel report={report} />
      <LinksPanel report={report} />
      <ProgramsPanel report={report} />
      {report.memos.length ? <MemosPanel report={report} /> : null}
    </div>
  );
}

function TimingPanel({ report }: { report: ExposureReport }) {
  const max = Math.max(1, ...report.hours);
  const inWindow = (h: number) => report.busiest != null && (h - report.busiest.start + 24) % 24 < 6;
  return (
    <Panel className="span-5" eyebrow="Timing" title="When this wallet is active (UTC)">
      <div className="dx-hours" role="img" aria-label="Transactions per hour of day, UTC">
        {report.hours.map((v, h) => (
          <span key={h} className={inWindow(h) ? 'is-hot' : ''} title={`${pad2(h)}:00 UTC, ${v} tx`}>
            <i style={{ height: `${(v / max) * 100}%` }} />
          </span>
        ))}
      </div>
      <div className="dx-hours-axis">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
      <p className="p-small muted">
        {report.busiest
          ? `Highlighted: the busiest 6-hour window, ${Math.round(report.busiest.share * 100)}% of activity.`
          : 'No daily pattern: too little history, or it covers less than two days.'}
      </p>
    </Panel>
  );
}

function LinksPanel({ report }: { report: ExposureReport }) {
  const { cluster } = useWallet();
  const [now] = useState(Date.now);
  const top = report.counterparties.slice(0, 8);
  return (
    <Panel className="span-7" eyebrow="Links" title="Addresses tied to this wallet">
      {top.length ? (
        <table className="dx-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Times</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.address}>
                <td>
                  <Address address={c.address} cluster={cluster} />
                </td>
                <td>{c.count >= 2 ? <Pill tone="warn">{c.count}x</Pill> : c.count}</td>
                <td className="muted">{fmtAgo(c.lastTime, now)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty icon="eye" title="No direct links found" body="None of the transactions read moved value straight to or from another wallet." />
      )}
    </Panel>
  );
}

function ProgramsPanel({ report }: { report: ExposureReport }) {
  const rows = report.programs.filter((p) => !PLUMBING_PROGRAMS.has(p.id)).slice(0, 8);
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Panel className="span-5" eyebrow="Footprint" title="Programs this wallet uses">
      {rows.length ? (
        <ul className="dx-bars">
          {rows.map((p) => (
            <li key={p.id}>
              <span title={p.id}>{KNOWN_PROGRAMS[p.id] ?? shortAddr(p.id)}</span>
              <Meter value={p.count} max={max} tone="ink" />
              <span className="muted">{p.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="grid" title="No program calls" />
      )}
      <p className="p-small muted">Each app you use is a public tag on your wallet.</p>
    </Panel>
  );
}

function MemosPanel({ report }: { report: ExposureReport }) {
  const { cluster } = useWallet();
  return (
    <Panel className="span-12" eyebrow="Memos" title="Text written to the chain">
      <ul className="dx-memos">
        {report.memos.slice(0, 10).map((m) => (
          <li key={m.signature}>
            <span className="dx-memo-text">{m.memo}</span>
            <span className="muted">{fmtDateTime(m.blockTime)}</span>
            <a href={explorerTx(m.signature, cluster)} target="_blank" rel="noopener noreferrer" className="dx-icon-btn" aria-label="Open in Solscan">
              <Icon name="arrowNE" />
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
