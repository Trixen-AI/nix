import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ActivityRow } from '@/app/activity';
import { useLinkCounts } from '@/app/lib/activity';
import { CLUSTER_LABEL, usingSharedRpc } from '@/app/config';
import { useActivity, useTokenMeta, useWallet } from '@/app/hooks';
import type { TxKind } from '@/app/lib/solana';
import { ConnectPrompt } from '@/app/shared';
import { Empty, ErrorNote, HistoryNote, PageHead, Panel, Skeleton } from '@/app/ui';

const FILTERS: { key: 'all' | TxKind; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'send', label: 'Sent' },
  { key: 'receive', label: 'Received' },
  { key: 'swap', label: 'Swaps' },
  { key: 'other', label: 'Program calls' },
  { key: 'failed', label: 'Failed' },
];

export default function Activity() {
  const { address, cluster } = useWallet();
  return (
    <>
      <title>Activity | ZKSona</title>
      <PageHead
        eyebrow="#05 / activity"
        title="Your public history"
        body={`Every transaction ${CLUSTER_LABEL[cluster]} keeps on record for this wallet, with the details that tie it back to you marked.`}
      />
      {address ? <ActivityBody address={address} /> : <ConnectPrompt what="Connect to read your transaction history." />}
    </>
  );
}

function ActivityBody({ address }: { address: string }) {
  const { cluster } = useWallet();
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS.find((f) => f.key === params.get('type'))?.key ?? 'all') as (typeof FILTERS)[number]['key'];
  const q = useActivity(address, cluster);
  const all = useMemo(() => q.data?.pages.flatMap((p) => p.items) ?? [], [q.data]);
  const items = filter === 'all' ? all : all.filter((t) => t.kind === filter);
  const meta = useTokenMeta(all.flatMap((t) => t.changes.map((c) => c.asset)).filter((a) => a !== 'SOL'), cluster);
  const linkCounts = useLinkCounts(all);
  const [now] = useState(Date.now);

  return (
    <Panel
      eyebrow={`${all.length} loaded`}
      title="Transactions"
      action={
        <div className="dx-filters" role="tablist" aria-label="Filter by type">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`dx-chip${filter === f.key ? ' is-on' : ''}`}
              onClick={() => setParams(f.key === 'all' ? {} : { type: f.key }, { replace: true })}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {q.isLoading ? (
        <Skeleton lines={8} />
      ) : q.error ? (
        <ErrorNote error={q.error} onRetry={() => q.refetch()} />
      ) : items.length ? (
        <ul className="dx-txs">
          {items.map((t) => (
            <ActivityRow key={t.signature} t={t} cluster={cluster} meta={meta.data} linkCounts={linkCounts} now={now} />
          ))}
        </ul>
      ) : (
        <Empty
          icon="list"
          title={all.length ? 'Nothing of this type in what is loaded' : 'No transactions yet'}
          body={all.length && q.hasNextPage ? 'Load older transactions to look further back.' : undefined}
        />
      )}
      {q.hasNextPage ? (
        <div className="dx-more">
          <button type="button" className="btn btn-ghost" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
            {q.isFetchingNextPage ? 'Loading...' : 'Load older'}
          </button>
        </div>
      ) : null}
      {q.data && !q.hasNextPage && usingSharedRpc(cluster) ? <HistoryNote shown={all.length} /> : null}
    </Panel>
  );
}
