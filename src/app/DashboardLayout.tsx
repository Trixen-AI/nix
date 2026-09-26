import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { appKitReady } from '@/app/appkit';
import { CLUSTER_LABEL } from '@/app/config';
import { usePortfolio, useWallet } from '@/app/hooks';
import { fmtAmount, shortAddr } from '@/app/lib/format';
import { Logo } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import './dashboard.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type NavItem = { to: string; label: string; icon: IconName; end?: boolean };

// Same grouping as the website's Protocol menu: Transact, Protect, Observe.
const NAV: { group: string | null; items: NavItem[] }[] = [
  { group: null, items: [{ to: '/app', label: 'Overview', icon: 'home', end: true }] },
  { group: 'Transact', items: [{ to: '/app/private-tx', label: 'Private TX', icon: 'lock' }] },
  {
    group: 'Protect',
    items: [
      { to: '/app/vault', label: 'Shield Vault', icon: 'shield' },
      { to: '/app/exposure', label: 'Exposure', icon: 'eye' },
    ],
  },
  {
    group: 'Observe',
    items: [
      { to: '/app/activity', label: 'Activity', icon: 'list' },
      { to: '/app/assets', label: 'Assets', icon: 'coins' },
      { to: '/app/network', label: 'Network', icon: 'pulse' },
    ],
  },
];

function SideNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="dx-nav" aria-label="Dashboard">
      {NAV.map((g) => (
        <div className="dx-nav-group" key={g.group ?? 'root'}>
          {g.group ? <p className="dd-title">{g.group}</p> : null}
          {g.items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className="dx-nav-link" onClick={onNavigate}>
              <span className="dd-icon">
                <Icon name={it.icon} />
              </span>
              {it.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function WalletButton() {
  const { address, cluster, connecting, connect, openAccount } = useWallet();
  const { holdings } = usePortfolio(address, cluster);
  if (!address) {
    return (
      <button type="button" className="btn btn-accent" onClick={connect} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect wallet'}
      </button>
    );
  }
  return (
    <button type="button" className="dx-wallet" onClick={openAccount} aria-label="Wallet account">
      <span className="dx-wallet-bal">{holdings ? `${fmtAmount(holdings.sol, 3)} SOL` : '...'}</span>
      <span className="dx-wallet-addr">{shortAddr(address)}</span>
    </button>
  );
}

function NetworkButton() {
  const { cluster, openNetworks } = useWallet();
  return (
    <button type="button" className={`dx-net is-${cluster}`} onClick={openNetworks} aria-label={`Network: ${CLUSTER_LABEL[cluster]}. Change network`}>
      <i />
      <span>{cluster === 'mainnet' ? 'Mainnet' : 'Devnet'}</span>
    </button>
  );
}

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const close = () => setNavOpen(false);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className={`dx${navOpen ? ' nav-open' : ''}`}>
      <meta name="robots" content="noindex" />
      <aside className="dx-side">
        <div className="dx-side-top">
          <Link to="/" className="dx-logo" aria-label="Zentry website">
            <Logo />
          </Link>
          <button type="button" className="dx-icon-btn dx-side-close" onClick={close} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
        <SideNav onNavigate={close} />
        <div className="dx-side-foot">
          <Link to="/" className="dx-back" onClick={close}>
            <Icon name="arrowLeft" />
            Back to website
          </Link>
        </div>
      </aside>
      <button type="button" className="dx-scrim" aria-label="Close menu" tabIndex={-1} onClick={close} />

      <div className="dx-main">
        <div className="dx-top">
          <button type="button" className="nav-burger dx-burger" aria-label="Open menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
            <span />
          </button>
          <Link to="/" className="dx-top-logo" aria-label="Zentry website">
            <Logo />
          </Link>
          <div className="dx-top-actions">
            <NetworkButton />
            <WalletButton />
          </div>
        </div>
        <main className="dx-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SetupRequired() {
  return (
    <div className="dx-setup">
      <meta name="robots" content="noindex" />
      <title>Dashboard setup | Zentry</title>
      <Link to="/" className="dx-logo" aria-label="Zentry website">
        <Logo />
      </Link>
      <div className="dx-panel is-frame dx-setup-card">
        <p className="eyebrow">Setup needed</p>
        <h1 className="h3">Wallet connection is not configured</h1>
        <p className="p muted">
          The dashboard connects Solana wallets through Reown AppKit. Add your Reown project ID to the environment and restart the
          app:
        </p>
        <pre className="dx-code">VITE_REOWN_PROJECT_ID=your-project-id</pre>
        <p className="p-small muted">
          Create a project at cloud.reown.com, then add this site's domain (and localhost for development) to the project's allowed
          domains.
        </p>
        <Link to="/" className="btn btn-dark">
          Back to website
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  if (!appKitReady) return <SetupRequired />;
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}
