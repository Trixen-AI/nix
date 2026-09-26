import { useState, type ReactNode } from 'react';
import solanaMark from '@/assets/chains/solana.svg?raw';
import { Icon, type IconName } from '@/components/ui/Icon';
import { explorerAccount, type Cluster } from '@/app/config';
import { shortAddr } from '@/app/lib/format';

export function PageHead({ eyebrow, title, body, actions }: { eyebrow: string; title: string; body?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="dx-head">
      <div className="dx-head-text">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h3">{title}</h1>
        {body ? <p className="p muted dx-head-body">{body}</p> : null}
      </div>
      {actions ? <div className="dx-head-actions">{actions}</div> : null}
    </header>
  );
}

type PanelProps = {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  tone?: 'grey' | 'white' | 'dark' | 'frame';
  className?: string;
  children: ReactNode;
};

export function Panel({ title, eyebrow, action, tone = 'grey', className = '', children }: PanelProps) {
  return (
    <section className={`dx-panel is-${tone} ${className}`}>
      {title || eyebrow || action ? (
        <div className="dx-panel-head">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="dx-panel-title">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="dx-stat">
      <p className="dx-stat-label">{label}</p>
      <p className="dx-stat-value">{value}</p>
      {sub ? <p className="dx-stat-sub">{sub}</p> : null}
    </div>
  );
}

/** Solana uses its official mark (unmodified file). Other tokens get a neutral monogram, never a fetched raster logo. */
export function TokenMark({ symbol, isSol, size = 32 }: { symbol: string; isSol?: boolean; size?: number }) {
  if (isSol) {
    return (
      <span
        className="dx-token is-sol"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Solana"
        dangerouslySetInnerHTML={{ __html: solanaMark }}
      />
    );
  }
  const text = symbol.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || '?';
  return (
    <svg className="dx-token" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={symbol}>
      <circle cx="16" cy="16" r="16" fill="var(--accent-soft)" />
      <text x="16" y="16" dy="0.36em" textAnchor="middle" fontSize={text.length > 2 ? 9 : 11} fontWeight="600" fill="var(--accent-deep)" fontFamily="var(--font-mono)">
        {text}
      </text>
    </svg>
  );
}

export function CopyButton({ value, label = 'Copy address' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      window.setTimeout(() => setDone(false), 1400);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <button type="button" className="dx-icon-btn" onClick={copy} aria-label={done ? 'Copied' : label} title={done ? 'Copied' : label}>
      <Icon name={done ? 'check' : 'copy'} />
    </button>
  );
}

export function Address({ address, cluster, chars = 4, copy = true }: { address: string; cluster: Cluster; chars?: number; copy?: boolean }) {
  return (
    <span className="dx-addr">
      <a href={explorerAccount(address, cluster)} target="_blank" rel="noopener noreferrer" title={address}>
        {shortAddr(address, chars)}
      </a>
      {copy ? <CopyButton value={address} /> : null}
    </span>
  );
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = score < 30 ? 'var(--accent)' : score < 60 ? 'var(--warn)' : 'var(--danger)';
  return (
    <svg className="dx-ring" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Exposure score ${score} of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--medium-grey)" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="300" fill="var(--ink)" fontFamily="var(--font-sans)">
        {score}
      </text>
      <text x="60" y="78" textAnchor="middle" fontSize="10" fill="var(--ink-64)" fontFamily="var(--font-mono)" letterSpacing="1">
        / 100
      </text>
    </svg>
  );
}

export function Meter({ value, max = 1, tone = 'accent' }: { value: number; max?: number; tone?: 'accent' | 'warn' | 'high' | 'ink' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span className={`dx-meter is-${tone}`}>
      <i style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="dx-skel" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <i key={i} style={{ width: `${92 - i * 14}%` }} />
      ))}
    </div>
  );
}

export function ErrorNote({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="dx-note is-warn" role="alert">
      <Icon name="alert" />
      <div>
        <p>Could not load this from the network.</p>
        <p className="dx-note-sub">{msg.slice(0, 180)}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-ghost dx-note-btn" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function HistoryNote({ shown }: { shown: number }) {
  return (
    <p className="p-small muted dx-history-note">
      <Icon name="info" /> {shown} transaction{shown === 1 ? '' : 's'} returned. This app is on a shared RPC, which may only keep recent
      history. A dedicated RPC (VITE_SOLANA_RPC_URL) returns the full record.
    </p>
  );
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="dx-empty">
      <span className="dd-icon">
        <Icon name={icon} />
      </span>
      <p className="dx-empty-title">{title}</p>
      {body ? <p className="p-small muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function Pill({ tone = 'grey', children }: { tone?: 'grey' | 'accent' | 'ok' | 'warn' | 'high' | 'dark'; children: ReactNode }) {
  return <span className={`dx-pill is-${tone}`}>{children}</span>;
}
