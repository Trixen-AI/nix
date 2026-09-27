import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
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

// One row of tabs in the order a user works: look, act, protect, review.
const NAV: NavItem[] = [
  { to: '/app', label: 'Overview', icon: 'home', end: true },
  { to: '/app/private-tx', label: 'Private TX', icon: 'lock' },
  { to: '/app/vault', label: 'Shield Vault', icon: 'shield' },
  { to: '/app/exposure', label: 'Exposure', icon: 'eye' },
  { to: '/app/activity', label: 'Activity', icon: 'list' },
  { to: '/app/assets', label: 'Assets', icon: 'coins' },
  { to: '/app/network', label: 'Network', icon: 'pulse' },
];

function Tabs() {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  // On narrow screens the tab row scrolls; keep the current page's tab in view.
  useEffect(() => {
    ref.current?.querySelector('.dx-tab.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [pathname]);
  return (
    <nav className="dx-tabs" aria-label="Dashboard" ref={ref}>
      {NAV.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className="dx-tab">
          <Icon name={it.icon} />
          {it.label}
        </NavLink>
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
  return (
    <div className="dx">
      <meta name="robots" content="noindex" />
      <header className="dx-bar">
        <div className="dx-bar-row">
          <Link to="/" className="dx-logo" aria-label="ZKSona website">
            <Logo tone="dark" />
          </Link>
          <Tabs />
          <div className="dx-top-actions">
            <NetworkButton />
            <WalletButton />
          </div>
        </div>
      </header>
      <main className="dx-content">
        <Outlet />
      </main>
      <footer className="dx-foot">
        <Link to="/" className="dx-back">
          <Icon name="arrowLeft" />
          Back to website
        </Link>
        <span className="dx-foot-note">ZKSona · private by proof</span>
      </footer>
    </div>
  );
}

function SetupRequired() {
  return (
    <div className="dx-setup">
      <meta name="robots" content="noindex" />
      <title>Dashboard setup | ZKSona</title>
      <Link to="/" className="dx-logo" aria-label="ZKSona website">
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
