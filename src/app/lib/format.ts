const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const usdSmallFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 });
const intFmt = new Intl.NumberFormat('en-US');

export const shortAddr = (a: string, n = 4) => (a.length > n * 2 + 3 ? `${a.slice(0, n)}...${a.slice(-n)}` : a);

export function fmtUsd(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return 'n/a';
  if (v !== 0 && Math.abs(v) < 0.01) return usdSmallFmt.format(v);
  return usdFmt.format(v);
}

/** Token amounts: more decimals for small values, never scientific notation. */
export function fmtAmount(v: number, maxDecimals = 6): string {
  const abs = Math.abs(v);
  const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : maxDecimals;
  return v.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export const fmtInt = (v: number) => intFmt.format(Math.round(v));

export function fmtAgo(unixSeconds: number | null | undefined, now = Date.now()): string {
  if (!unixSeconds) return 'pending';
  const s = Math.max(0, Math.round(now / 1000 - unixSeconds));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return 'pending';
  return new Date(unixSeconds * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
