// Mainnet market data from Jupiter's public APIs (prices and token names). Devnet tokens have no market.
import { SOL_MINT } from '@/app/config';

const JUP = 'https://lite-api.jup.ag';

export type TokenMeta = { symbol: string; name: string; decimals: number; verified: boolean };

const chunk = <T,>(xs: T[], n: number) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** USD price per mint. Mints Jupiter cannot price are simply absent. */
export async function fetchPrices(mints: string[]): Promise<Record<string, number>> {
  const ids = [...new Set([SOL_MINT, ...mints])];
  const parts = await Promise.all(
    chunk(ids, 50).map((ids) => getJson<Record<string, { usdPrice?: number } | null>>(`${JUP}/price/v3?ids=${ids.join(',')}`)),
  );
  const out: Record<string, number> = {};
  for (const part of parts) for (const [mint, p] of Object.entries(part)) if (p?.usdPrice != null) out[mint] = p.usdPrice;
  return out;
}

type JupToken = { id: string; symbol?: string; name?: string; decimals?: number; isVerified?: boolean };

export async function fetchTokenMeta(mints: string[]): Promise<Record<string, TokenMeta>> {
  if (mints.length === 0) return {};
  const wanted = new Set(mints);
  const parts = await Promise.all(chunk(mints, 20).map((ids) => getJson<JupToken[]>(`${JUP}/tokens/v2/search?query=${ids.join(',')}`)));
  const out: Record<string, TokenMeta> = {};
  for (const list of parts) {
    for (const t of list) {
      if (!wanted.has(t.id) || out[t.id]) continue;
      out[t.id] = { symbol: t.symbol ?? '', name: t.name ?? '', decimals: t.decimals ?? 0, verified: Boolean(t.isVerified) };
    }
  }
  return out;
}
