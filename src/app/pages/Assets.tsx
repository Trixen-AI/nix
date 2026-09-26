import { Link } from 'react-router';
import { CLUSTER_LABEL } from '@/app/config';
import { usePortfolio, useWallet } from '@/app/hooks';
import { fmtAmount, fmtUsd } from '@/app/lib/format';
import { ConnectPrompt } from '@/app/shared';
import { Address, ErrorNote, Meter, PageHead, Panel, Skeleton, Stat, TokenMark } from '@/app/ui';

export default function Assets() {
  const { address, cluster } = useWallet();
  return (
    <>
      <title>Assets | Zentry</title>
      <PageHead
        eyebrow="/// observe"
        title="Assets"
        body={`Everything this wallet holds on ${CLUSTER_LABEL[cluster]}. All of it is public until you move it through Zentry.`}
      />
      {address ? <AssetsBody address={address} /> : <ConnectPrompt what="Connect to see your SOL and SPL token balances." />}
    </>
  );
}

function AssetsBody({ address }: { address: string }) {
  const { cluster } = useWallet();
  const p = usePortfolio(address, cluster);
  if (p.isLoading) {
    return (
      <Panel>
        <Skeleton lines={6} />
      </Panel>
    );
  }
  if (p.error) return <ErrorNote error={p.error} onRetry={() => p.refetch()} />;
  const total = p.totalUsd ?? 0;

  return (
    <div className="dx-grid">
      <Panel tone="frame" className="span-12">
        <div className="dx-stats">
          <Stat label="Public value" value={cluster === 'mainnet' ? fmtUsd(p.totalUsd) : 'No market on devnet'} sub={p.marketLoading ? 'Loading prices...' : 'Prices from Jupiter'} />
          <Stat label="Tokens" value={p.rows.length} sub="SOL plus fungible SPL tokens" />
          <Stat label="NFTs" value={p.holdings?.nftCount ?? 0} sub="Single-supply tokens, not listed" />
          <Stat label="Empty token accounts" value={p.holdings?.emptyAccounts ?? 0} sub="Each still holds rent and still links to you" />
        </div>
        <div className="dx-balance-foot">
          <Address address={address} cluster={cluster} chars={6} />
        </div>
      </Panel>

      <Panel className="span-12" eyebrow="Holdings" title="Balances">
        <div className="dx-table-wrap">
          <table className="dx-table dx-assets">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="num">Balance</th>
                <th className="num">Price</th>
                <th className="num">Value</th>
                <th className="dx-hide-sm">Share</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {p.rows.map((r) => (
                <tr key={r.mint}>
                  <td>
                    <span className="dx-asset">
                      <TokenMark symbol={r.symbol} isSol={r.isSol} />
                      <span>
                        <strong>{r.symbol}</strong>
                        <small className="muted">{r.name}</small>
                      </span>
                    </span>
                  </td>
                  <td className="num">{fmtAmount(r.amount)}</td>
                  <td className="num muted">{r.price != null ? fmtUsd(r.price) : 'n/a'}</td>
                  <td className="num">{r.usd != null ? fmtUsd(r.usd) : 'n/a'}</td>
                  <td className="dx-hide-sm">{total > 0 && r.usd != null ? <Meter value={r.usd} max={total} /> : null}</td>
                  <td className="dx-row-actions">
                    <Link className="btn btn-ghost" to={`/app/private-tx?asset=${r.mint}`}>
                      Send privately
                    </Link>
                    <Link className="btn btn-ghost dx-hide-sm" to={`/app/vault?asset=${r.mint}`}>
                      Lock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
