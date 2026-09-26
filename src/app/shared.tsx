import { useState } from 'react';
import { Link } from 'react-router';
import { useWallet } from '@/app/hooks';
import type { Approval } from '@/app/lib/approvals';
import { fmtAgo, shortAddr } from '@/app/lib/format';
import { CopyButton, Empty, Panel, Pill } from '@/app/ui';
import { Icon } from '@/components/ui/Icon';

export function ConnectPrompt({ what }: { what: string }) {
  const { connect, connecting } = useWallet();
  return (
    <div className="dx-panel is-frame dx-connect">
      <span className="dd-icon dx-connect-icon">
        <Icon name="wallet" />
      </span>
      <h2 className="h4">Connect a Solana wallet</h2>
      <p className="p muted">{what}</p>
      <button type="button" className="btn btn-accent" onClick={connect} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect wallet'}
      </button>
      <p className="p-small muted">
        Read-only until you sign. Want to see what any address gives away first? <Link to="/app/exposure">Scan an address</Link>.
      </p>
    </div>
  );
}

/** Signed approvals for this wallet, newest first. */
export function ApprovalsPanel({ title, items, onClear }: { title: string; items: Approval[]; onClear: () => void }) {
  const [now] = useState(Date.now);
  return (
    <Panel
      className="span-12"
      eyebrow="Approvals"
      title={title}
      action={
        items.length ? (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Clear
          </button>
        ) : null
      }
    >
      {items.length ? (
        <ul className="dx-approvals">
          {items.map((a) => (
            <li key={a.id}>
              <span className="dd-icon">
                <Icon name="check" />
              </span>
              <div className="dx-approval-main">
                <p>{a.summary}</p>
                <p className="dx-tx-sub">
                  Signed {shortAddr(a.signature, 6)} · {fmtAgo(a.createdAt / 1000, now)}
                </p>
              </div>
              <Pill tone="accent">Approved</Pill>
              <CopyButton value={a.message} label="Copy signed message" />
            </li>
          ))}
        </ul>
      ) : (
        <Empty icon="check" title="No approvals yet" body="Approved requests from this wallet show up here." />
      )}
    </Panel>
  );
}
