import { LOGO } from '@/data/logo';

type Props = {
  className?: string;
  tone?: 'light' | 'dark';
  title?: string;
};

/** Eclipse mark: a persona (dark disc) partly covered on an orange tile. */
export function Mark({ disc = 'var(--ink)', tile = 'var(--accent)' }: { disc?: string; tile?: string }) {
  const { tile: t, disc: d, cover: c } = LOGO.mark;
  return (
    <>
      <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.r} fill={tile} />
      <circle cx={d.cx} cy={d.cy} r={d.r} fill={disc} />
      <circle cx={c.cx} cy={c.cy} r={c.r} fill={tile} />
    </>
  );
}

/** The ZKSona lockup: eclipse mark plus the outlined "zksona" wordmark. */
export function Logo({ className, tone = 'light', title = 'ZKSona' }: Props) {
  const ink = tone === 'light' ? 'var(--ink)' : 'var(--white)';
  return (
    <svg className={className} viewBox={`0 0 ${LOGO.width} ${LOGO.height}`} role="img" aria-label={title}>
      <Mark />
      <path d={LOGO.word} fill={ink} />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <Mark />
    </svg>
  );
}

/** Oversized footer wordmark with a vertical fade, cropped at the page bottom. */
export function FooterWordmark() {
  const x = LOGO.wordBox.x;
  const w = LOGO.wordBox.width;
  return (
    <svg className="footer-wordmark" viewBox={`${x - 1} 2 ${w + 2} 50`} aria-hidden="true" preserveAspectRatio="xMidYMin meet">
      <defs>
        <linearGradient id="fw-fade" x1="0" y1="2" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f98500" />
          <stop offset="1" stopColor="#f98500" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <path d={LOGO.word} fill="url(#fw-fade)" />
    </svg>
  );
}
