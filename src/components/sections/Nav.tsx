import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { ArrowNE, Icon } from '@/components/ui/Icon';
import { DASHBOARD_URL, NAV_NETWORK, NAV_PROTOCOL, NAV_RESOURCES, type NavLink } from '@/data/content';

type MenuKey = 'protocol' | 'network' | 'resources';

const ext = (l: NavLink) => (l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {});

function ProtocolColumns() {
  return (
    <>
      {NAV_PROTOCOL.map((col) => (
        <div className="dd-col" key={col.title}>
          <p className="dd-title">{col.title}</p>
          {col.links.map((l) => (
            <a className="dd-link" href={l.href} key={l.label} {...ext(l)}>
              {l.icon ? (
                <span className="dd-icon">
                  <Icon name={l.icon} />
                </span>
              ) : null}
              {l.label}
              {l.external ? <ArrowNE /> : null}
            </a>
          ))}
        </div>
      ))}
    </>
  );
}

function PlainList({ links }: { links: NavLink[] }) {
  return (
    <>
      {links.map((l) => (
        <a href={l.href} key={l.label} {...ext(l)}>
          {l.label}
          {l.external ? <ArrowNE /> : null}
        </a>
      ))}
    </>
  );
}

const MENUS: { key: MenuKey; label: string; kind: 'columns' | 'list'; body: ReactNode }[] = [
  { key: 'protocol', label: 'Protocol', kind: 'columns', body: <ProtocolColumns /> },
  { key: 'network', label: 'Network', kind: 'list', body: <PlainList links={NAV_NETWORK} /> },
  { key: 'resources', label: 'Resources', kind: 'list', body: <PlainList links={NAV_RESOURCES} /> },
];

export function Nav() {
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enter = (key: MenuKey) => {
    if (!isDesktop()) return;
    window.clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const leave = () => {
    if (!isDesktop()) return;
    closeTimer.current = window.setTimeout(() => setOpen(null), 120);
  };

  return (
    <header className={`nav${mobileOpen ? ' menu-open' : ''}`}>
      <div className="container nav-inner">
        <a className="nav-logo" href="#top" aria-label="Nix Shield home">
          <Logo />
        </a>

        <nav className="nav-menu" aria-label="Main">
          {MENUS.map((m) => (
            <div
              key={m.key}
              className={`nav-item${open === m.key ? ' is-open' : ''}`}
              onMouseEnter={() => enter(m.key)}
              onMouseLeave={leave}
            >
              <button
                type="button"
                className="nav-toggle"
                aria-expanded={open === m.key}
                onClick={() => setOpen((cur) => (cur === m.key ? null : m.key))}
              >
                {m.label}
                <Icon name="chevron" className="chev" />
              </button>
              <div className={`nav-dropdown ${m.kind}`}>{m.body}</div>
            </div>
          ))}
        </nav>

        <div className="nav-actions">
          <a className="btn btn-dark" href={DASHBOARD_URL}>
            Dashboard
          </a>
          <button
            type="button"
            className="nav-burger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
