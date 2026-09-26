import type { Provider } from '@reown/appkit-adapter-solana/react';
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { EXPOSURE_WINDOW, SOL_MINT, clusterFromChainId, type Cluster } from '@/app/config';
import { analyzeExposure } from '@/app/lib/exposure';
import { fetchPrices, fetchTokenMeta, type TokenMeta } from '@/app/lib/market';
import {
  fetchActivityPage,
  fetchHoldings,
  fetchNetworkStats,
  getConnection,
} from '@/app/lib/solana';

/* ---------------------------------------------------------------- Wallet */

export function useWallet() {
  const { address, isConnected, status } = useAppKitAccount({ namespace: 'solana' });
  const { chainId } = useAppKitNetwork();
  const { open } = useAppKit();
  return {
    address: isConnected && address ? address : undefined,
    connecting: status === 'connecting' || status === 'reconnecting',
    cluster: clusterFromChainId(chainId),
    connect: () => open({ view: 'Connect', namespace: 'solana' }),
    openAccount: () => open({ view: 'Account' }),
    openNetworks: () => open({ view: 'Networks' }),
  };
}

/* ---------------------------------------------------------------- Holdings + market */

const MARKET_CAP = 100;

export type AssetRow = {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  price: number | null;
  usd: number | null;
  isSol: boolean;
};

function useMarket(mints: string[], cluster: Cluster, enabled: boolean) {
  const key = [...mints].sort().join(',');
  return useQuery({
    queryKey: ['market', key],
    queryFn: async () => {
      const [prices, meta] = await Promise.all([fetchPrices(mints), fetchTokenMeta(mints)]);
      return { prices, meta };
    },
    enabled: enabled && cluster === 'mainnet',
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useTokenMeta(mints: string[], cluster: Cluster) {
  const key = [...new Set(mints)].sort().join(',');
  return useQuery({
    queryKey: ['token-meta', key],
    queryFn: () => fetchTokenMeta(key.split(',')),
    enabled: cluster === 'mainnet' && key.length > 0,
    staleTime: 10 * 60_000,
  });
}

export function symbolFor(asset: string, meta: Record<string, TokenMeta> | undefined) {
  if (asset === 'SOL' || asset === SOL_MINT) return 'SOL';
  const m = meta?.[asset];
  return m?.symbol || `${asset.slice(0, 4)}...`;
}

export function usePortfolio(address: string | undefined, cluster: Cluster) {
  const holdings = useQuery({
    queryKey: ['holdings', cluster, address],
    queryFn: () => fetchHoldings(getConnection(cluster), address!),
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });
  // Wallets with thousands of tokens would mean hundreds of price calls; the first MARKET_CAP are priced and named.
  const mints = useMemo(() => holdings.data?.tokens.slice(0, MARKET_CAP).map((t) => t.mint) ?? [], [holdings.data]);
  const market = useMarket(mints, cluster, Boolean(holdings.data));

  const rows = useMemo<AssetRow[]>(() => {
    const h = holdings.data;
    if (!h) return [];
    const prices = market.data?.prices;
    const meta = market.data?.meta;
    const priced = (mint: string, amount: number) => (prices?.[mint] != null ? prices[mint] * amount : null);
    const sol: AssetRow = {
      mint: SOL_MINT,
      symbol: 'SOL',
      name: 'Solana',
      amount: h.sol,
      decimals: 9,
      price: prices?.[SOL_MINT] ?? null,
      usd: priced(SOL_MINT, h.sol),
      isSol: true,
    };
    const tokens = h.tokens.map<AssetRow>((t) => ({
      mint: t.mint,
      symbol: meta?.[t.mint]?.symbol || `${t.mint.slice(0, 4)}...`,
      name: meta?.[t.mint]?.name || 'Unknown token',
      amount: t.amount,
      decimals: t.decimals,
      price: prices?.[t.mint] ?? null,
      usd: priced(t.mint, t.amount),
      isSol: false,
    }));
    tokens.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1) || b.amount - a.amount);
    return [sol, ...tokens];
  }, [holdings.data, market.data]);

  const totalUsd = cluster === 'mainnet' && market.data ? rows.reduce((a, r) => a + (r.usd ?? 0), 0) : null;

  return {
    rows,
    totalUsd,
    holdings: holdings.data,
    isLoading: holdings.isLoading,
    error: holdings.error,
    refetch: holdings.refetch,
    marketLoading: market.isLoading && cluster === 'mainnet',
  };
}

/* ---------------------------------------------------------------- Activity + exposure */

export const ACTIVITY_PAGE = 25;

export function useActivity(address: string | undefined, cluster: Cluster) {
  return useInfiniteQuery({
    queryKey: ['activity', cluster, address],
    queryFn: ({ pageParam }) => fetchActivityPage(getConnection(cluster), address!, ACTIVITY_PAGE, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    enabled: Boolean(address),
    staleTime: 30_000,
  });
}

/** Reads the last EXPOSURE_WINDOW transactions of any address and scores them. */
export function useExposure(address: string | undefined, cluster: Cluster, visibleUsd: number | null, hasBalance: boolean) {
  const txs = useQuery({
    queryKey: ['exposure-tx', cluster, address],
    queryFn: () => fetchActivityPage(getConnection(cluster), address!, EXPOSURE_WINDOW),
    enabled: Boolean(address),
    staleTime: 5 * 60_000,
  });
  const report = useMemo(
    () => (txs.data ? analyzeExposure(txs.data.items, visibleUsd, hasBalance) : undefined),
    [txs.data, visibleUsd, hasBalance],
  );
  return { report, items: txs.data?.items, isLoading: txs.isLoading, error: txs.error, refetch: txs.refetch, isFetching: txs.isFetching };
}

/* ---------------------------------------------------------------- Network + protocol */

export function useNetwork(cluster: Cluster) {
  return useQuery({
    queryKey: ['network', cluster],
    queryFn: () => fetchNetworkStats(getConnection(cluster)),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}

/* ---------------------------------------------------------------- Signing */

/** Asks the connected wallet to sign a plain-text message (no transaction, no funds moved). */
export function useSignMessage() {
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  return useCallback(
    async (text: string) => {
      if (!walletProvider) throw new Error('Connect a wallet first.');
      return walletProvider.signMessage(new TextEncoder().encode(text));
    },
    [walletProvider],
  );
}

export function signError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return /reject|denied|cancel/i.test(msg) ? 'Approval cancelled in your wallet.' : `Wallet could not sign: ${msg.slice(0, 140)}`;
}
