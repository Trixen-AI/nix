import { useMemo } from 'react';
import { KNOWN_PROGRAMS, PLUMBING_PROGRAMS } from '@/app/config';
import { shortAddr } from '@/app/lib/format';
import type { TxSummary } from '@/app/lib/solana';

export function mainProgram(t: TxSummary) {
  const named = t.programs.find((p) => KNOWN_PROGRAMS[p] && !PLUMBING_PROGRAMS.has(p) && p !== '11111111111111111111111111111111');
  const any = named ?? t.programs.find((p) => !PLUMBING_PROGRAMS.has(p));
  return any ? KNOWN_PROGRAMS[any] ?? shortAddr(any) : 'System';
}

/** Counts how often each counterparty appears in the loaded list, so repeat links can be flagged per row. */
export function useLinkCounts(items: TxSummary[]) {
  return useMemo(() => {
    const m = new Map<string, number>();
    for (const t of items) for (const a of t.counterparties) m.set(a, (m.get(a) ?? 0) + 1);
    return m;
  }, [items]);
}
