import { explorerTx, type Cluster } from '@/app/config';
import { symbolFor } from '@/app/hooks';
import { mainProgram } from '@/app/lib/activity';
import { fmtAgo, fmtAmount, shortAddr } from '@/app/lib/format';
import type { TokenMeta } from '@/app/lib/market';
import type { TxKind, TxSummary } from '@/app/lib/solana';
import { Icon, type IconName } from '@/components/ui/Icon';

const KIND: Record<TxKind, { label: string; icon: IconName }> = {
  send: { label: 'Sent', icon: 'arrowNE' },
  receive: { label: 'Received', icon: 'arrowLeft' },
  swap: { label: 'Swapped', icon: 'swirl' },
  other: { label: 'Program call', icon: 'grid' },
  failed: { label: 'Failed', icon: 'alert' },
};

const isRound = (v: number) => {
  const a = Math.abs(v);
  return a >= 0.01 && Math.abs(a * 100 - Math.round(a * 100)) < 1e-6;
};

export function ActivityRow({
  t,
  cluster,
  meta,
  linkCounts,
  now,
}: {
  t: TxSummary;
  cluster: Cluster;
  meta: Record<string, TokenMeta> | undefined;
  linkCounts: Map<string, number>;
  now: number;
}) {
  const k = KIND[t.kind];
  const other = t.counterparties[0];
  const linked = t.counterparties.some((a) => (linkCounts.get(a) ?? 0) >= 2);
  const round = (t.kind === 'send' || t.kind === 'receive') && t.changes.some((c) => isRound(c.delta));
  const label = t.kind === 'other' ? (t.signer ? `Called ${mainProgram(t)}` : 'Referenced') : k.label;

  return (
    <li className={`dx-tx is-${t.kind}`}>
      <span className="dx-tx-icon">
        <Icon name={k.icon} />
      </span>
      <div className="dx-tx-main">
        <p className="dx-tx-title">
          {label}
          {t.kind === 'swap' ? <span className="dx-tx-via">via {mainProgram(t)}</span> : null}
        </p>
        <p className="dx-tx-sub">
          {other ? <>{t.kind === 'receive' ? 'from' : 'to'} {shortAddr(other)}</> : t.signer ? mainProgram(t) : `by another wallet, via ${mainProgram(t)}`}
          <span aria-hidden="true"> · </span>
          <time dateTime={t.blockTime ? new Date(t.blockTime * 1000).toISOString() : undefined}>{fmtAgo(t.blockTime, now)}</time>
        </p>
      </div>
      <div className="dx-tx-flags">
        {t.memo ? <span className="dx-flag is-high" title={t.memo}>Memo</span> : null}
        {linked ? <span className="dx-flag is-warn">Repeat link</span> : null}
        {round ? <span className="dx-flag">Round amount</span> : null}
      </div>
      <div className="dx-tx-amounts">
        {t.changes.length ? (
          t.changes.slice(0, 2).map((c) => (
            <span key={c.asset} className={c.delta < 0 ? 'is-out' : 'is-in'}>
              {c.delta > 0 ? '+' : ''}
              {fmtAmount(c.delta)} {symbolFor(c.asset, meta)}
            </span>
          ))
        ) : (
          <span className="muted">{t.failed ? 'No change' : 'No balance change'}</span>
        )}
      </div>
      <a className="dx-icon-btn" href={explorerTx(t.signature, cluster)} target="_blank" rel="noopener noreferrer" aria-label="Open in Solscan">
        <Icon name="arrowNE" />
      </a>
    </li>
  );
}
