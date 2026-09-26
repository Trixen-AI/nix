// Privacy exposure report: what an observer can learn from a wallet's public history.
// Every signal is computed from real transactions; nothing here is sampled or simulated.
import { fmtUsd, pad2 } from '@/app/lib/format';
import type { TxSummary } from '@/app/lib/solana';

export type Tier = 'Standard' | 'Enhanced' | 'Ghost';
export type SignalLevel = 'ok' | 'warn' | 'high';

export type Signal = { key: string; title: string; detail: string; points: number; max: number; level: SignalLevel };

export type Counterparty = { address: string; count: number; lastTime: number | null };

export type ExposureReport = {
  analyzed: number;
  firstTime: number | null;
  lastTime: number | null;
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  tier: Tier;
  signals: Signal[];
  counterparties: Counterparty[];
  /** Transactions per UTC hour. */
  hours: number[];
  busiest: { start: number; share: number } | null;
  programs: { id: string; count: number }[];
  memos: { signature: string; memo: string; blockTime: number | null }[];
};

const WINDOW_H = 6;
/** A daily pattern needs history that spans at least two days. */
const MIN_SPAN_S = 2 * 86_400;

const levelOf = (points: number, max: number): SignalLevel => (points / max < 0.34 ? 'ok' : points / max < 0.67 ? 'warn' : 'high');
const isRound = (v: number) => {
  const a = Math.abs(v);
  return a >= 0.01 && Math.abs(a * 100 - Math.round(a * 100)) < 1e-6;
};

export function tierForScore(score: number): Tier {
  return score < 30 ? 'Standard' : score < 60 ? 'Enhanced' : 'Ghost';
}

export function analyzeExposure(items: TxSummary[], visibleUsd: number | null, hasBalance: boolean): ExposureReport {
  const ok = items.filter((t) => !t.failed);
  const cpMap = new Map<string, Counterparty>();
  const programCount = new Map<string, number>();
  const hours = Array.from({ length: 24 }, () => 0);
  const memos: ExposureReport['memos'] = [];
  let transfers = 0;
  let rounds = 0;
  let firstTime: number | null = null;
  let lastTime: number | null = null;

  for (const t of items) {
    if (t.blockTime) {
      firstTime = firstTime == null ? t.blockTime : Math.min(firstTime, t.blockTime);
      lastTime = lastTime == null ? t.blockTime : Math.max(lastTime, t.blockTime);
      hours[new Date(t.blockTime * 1000).getUTCHours()] += 1;
    }
    if (t.memo) memos.push({ signature: t.signature, memo: t.memo, blockTime: t.blockTime });
    for (const p of t.programs) programCount.set(p, (programCount.get(p) ?? 0) + 1);
  }
  for (const t of ok) {
    for (const a of t.counterparties) {
      const c = cpMap.get(a);
      if (c) {
        c.count += 1;
        c.lastTime = Math.max(c.lastTime ?? 0, t.blockTime ?? 0) || null;
      } else cpMap.set(a, { address: a, count: 1, lastTime: t.blockTime });
    }
    if (t.kind === 'send' || t.kind === 'receive') {
      transfers += 1;
      if (t.changes.some((c) => isRound(c.delta))) rounds += 1;
    }
  }

  const counterparties = [...cpMap.values()].sort((a, b) => b.count - a.count || (b.lastTime ?? 0) - (a.lastTime ?? 0));
  const repeat = counterparties.filter((c) => c.count >= 2).length;

  // Busiest rolling 6-hour window (wrapping past midnight UTC).
  const timed = hours.reduce((a, b) => a + b, 0);
  let busiest: ExposureReport['busiest'] = null;
  const span = firstTime != null && lastTime != null ? lastTime - firstTime : 0;
  if (timed >= 5 && span >= MIN_SPAN_S) {
    for (let s = 0; s < 24; s++) {
      let sum = 0;
      for (let k = 0; k < WINDOW_H; k++) sum += hours[(s + k) % 24];
      if (!busiest || sum / timed > busiest.share) busiest = { start: s, share: sum / timed };
    }
  }

  const signals: Signal[] = [];
  {
    const max = 30;
    const points = Math.min(max, counterparties.length * 2 + repeat * 4);
    signals.push({
      key: 'links',
      title: 'Linked addresses',
      detail: counterparties.length
        ? `${counterparties.length} address${counterparties.length === 1 ? '' : 'es'} sit on the other side of this wallet's transfers, ${repeat} of them more than once. Repeat links are the easiest way to tie wallets together.`
        : 'No direct counterparties found in the transactions read.',
      points,
      max,
      level: levelOf(points, max),
    });
  }
  {
    const max = 15;
    const points = Math.min(max, memos.length * 5);
    signals.push({
      key: 'memos',
      title: 'Memos',
      detail: memos.length
        ? `${memos.length} transaction${memos.length === 1 ? ' carries' : 's carry'} a memo. Memo text is public and permanent.`
        : 'No memos attached. Nothing written in plain text.',
      points,
      max,
      level: levelOf(points, max),
    });
  }
  {
    const max = 20;
    const share = busiest?.share ?? 0;
    const points = busiest && share > 0.5 ? Math.round(((share - 0.5) / 0.5) * max) : 0;
    signals.push({
      key: 'timing',
      title: 'Timing pattern',
      detail: busiest
        ? `${Math.round(share * 100)}% of this wallet's activity falls between ${pad2(busiest.start)}:00 and ${pad2((busiest.start + WINDOW_H) % 24)}:00 UTC. A steady daily window hints at your time zone.`
        : timed >= 5
          ? 'The transactions read cover less than two days, too short to show a daily pattern.'
          : 'Too few timed transactions to see a daily pattern.',
      points,
      max,
      level: levelOf(points, max),
    });
  }
  {
    const max = 15;
    const share = transfers ? rounds / transfers : 0;
    const points = transfers >= 3 ? Math.round(share * max) : 0;
    signals.push({
      key: 'amounts',
      title: 'Round amounts',
      detail: transfers
        ? `${rounds} of ${transfers} transfers use round amounts. Round numbers make it easy to match what leaves one wallet with what arrives in another.`
        : 'No plain transfers in the transactions read.',
      points,
      max,
      level: levelOf(points, max),
    });
  }
  {
    const max = 10;
    const points = Math.min(max, Math.round(items.length / 10));
    signals.push({
      key: 'history',
      title: 'Readable history',
      detail: items.length
        ? items.length === 1
          ? 'Anyone with the address can read this transaction, forever.'
          : `Anyone with the address can replay these ${items.length} transactions, in order, forever.`
        : 'This wallet has no transactions yet.',
      points,
      max,
      level: levelOf(points, max),
    });
  }
  {
    const max = 10;
    const points = visibleUsd != null ? (visibleUsd >= 100 ? 10 : visibleUsd > 0 ? 5 : 0) : hasBalance ? 5 : 0;
    signals.push({
      key: 'balance',
      title: 'Visible balance',
      detail:
        visibleUsd != null && visibleUsd > 0
          ? `${fmtUsd(visibleUsd)} in holdings is readable by anyone who has the address.`
          : hasBalance
            ? 'The holdings are readable by anyone who has the address.'
            : 'No holdings on display.',
      points,
      max,
      level: levelOf(points, max),
    });
  }

  const score = Math.min(100, signals.reduce((a, s) => a + s.points, 0));
  return {
    analyzed: items.length,
    firstTime,
    lastTime,
    score,
    level: score < 30 ? 'Low' : score < 60 ? 'Moderate' : 'High',
    tier: tierForScore(score),
    signals,
    counterparties,
    hours,
    busiest,
    programs: [...programCount.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count),
    memos,
  };
}
