// Privacy agent: turns the exposure report and live network load into a tier and timing suggestion.
// Rule-based and transparent: every line of advice points at the number it came from.
import type { ExposureReport, Tier } from '@/app/lib/exposure';
import type { NetworkStats } from '@/app/lib/solana';

export type Crowd = { label: 'Busy' | 'Average' | 'Quiet'; ratio: number; detail: string };

export function crowdOf(stats: NetworkStats | undefined): Crowd | undefined {
  if (!stats || !stats.userTpsAvg) return undefined;
  const ratio = stats.userTps / stats.userTpsAvg;
  const pct = Math.round(Math.abs(ratio - 1) * 100);
  if (ratio >= 1.05)
    return { label: 'Busy', ratio, detail: `User activity is ${pct}% above the 30-minute average. More traffic means a bigger crowd to blend into.` };
  if (ratio >= 0.95) return { label: 'Average', ratio, detail: 'User activity is close to the 30-minute average.' };
  return { label: 'Quiet', ratio, detail: `User activity is ${pct}% below the 30-minute average. A thinner crowd makes timing easier to match.` };
}

export type Advice = { tier: Tier; headline: string; reasons: string[] };

const TIER_WHY: Record<Tier, string> = {
  Standard: 'Two hops are enough to break a direct link for a wallet this quiet.',
  Enhanced: 'Five hops plus a proof hide sender, receiver and amount from anyone reading the chain.',
  Ghost: 'Ten hops and a randomised delay stop anyone matching you by timing or amount.',
};

export function advise(report: ExposureReport | undefined, stats: NetworkStats | undefined): Advice | undefined {
  if (!report) return undefined;
  const reasons: string[] = [];
  let tier = report.tier;
  const worst = report.signals.filter((s) => s.level !== 'ok').sort((a, b) => b.points / b.max - a.points / a.max);
  for (const s of worst.slice(0, 2)) reasons.push(s.detail);
  const crowd = crowdOf(stats);
  if (crowd?.label === 'Quiet' && tier === 'Standard') {
    tier = 'Enhanced';
    reasons.push('The network is quiet right now, so the agent steps up one tier.');
  } else if (crowd) {
    reasons.push(crowd.detail);
  }
  reasons.push(TIER_WHY[tier]);
  return {
    tier,
    headline: `Exposure ${report.score}/100 (${report.level}). Suggested tier: ${tier}.`,
    reasons,
  };
}
