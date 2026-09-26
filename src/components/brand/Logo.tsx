import { LOGO } from '@/data/logo';

type Props = {
  className?: string;
  tone?: 'light' | 'dark';
  title?: string;
};

function Mark() {
  return (
    <>
      <path d={LOGO.shield} fill="var(--accent)" />
      <path d={LOGO.z} fill="var(--white)" />
    </>
  );
}

/** The Zentry lockup: violet shield with a Z-shaped route cut through it, plus the outlined wordmark. */
export function Logo({ className, tone = 'light', title = 'Zentry' }: Props) {
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

/** Oversized footer wordmark with a vertical fade, cropped at the page bottom like the reference. */
export function FooterWordmark() {
  const x = LOGO.wordBox.x;
  const w = LOGO.wordBox.width;
  return (
    <svg className="footer-wordmark" viewBox={`${x - 1} 2 ${w + 2} 48`} aria-hidden="true" preserveAspectRatio="xMidYMin meet">
      <defs>
        <linearGradient id="fw-fade" x1="0" y1="2" x2="0" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b4b4bd" />
          <stop offset="1" stopColor="#b4b4bd" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d={LOGO.word} fill="url(#fw-fade)" />
    </svg>
  );
}
