import { Link, Outlet, ScrollRestoration } from 'react-router';

/** Wraps the site and the dashboard so every route change starts at the top (or the restored position). */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

export function RouteFallback() {
  return (
    <div className="route-fallback" aria-busy="true">
      <span />
    </div>
  );
}

export function NotFound() {
  return (
    <main className="not-found">
      <title>Not found | ZKSona</title>
      <p className="eyebrow">/// 404</p>
      <h1 className="h3">Nothing lives at this address.</h1>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-dark">
          Website
        </Link>
        <Link to="/app" className="btn btn-ghost">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
