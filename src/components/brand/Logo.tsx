import { LOGO } from '@/data/logo';

type Props = {
  className?: string;
  tone?: 'light' | 'dark';
  title?: string;
};

function Mark({ ink, line }: { ink: string; line: string }) {
  const b = LOGO.bar;
  return (
    <>
      <path d={LOGO.shield} fill={ink} />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.r} fill={line} />
    </>
  );
}

/** The Nix Shield lockup: shield mark with a redaction bar, plus the outlined wordmark. */
export function Logo({ className, tone = 'light', title = 'Nix Shield' }: Props) {
  const ink = tone === 'light' ? 'var(--ink)' : 'var(--white)';
  const line = tone === 'light' ? 'var(--accent)' : 'var(--accent-deep)';
  return (
    <svg className={className} viewBox={`0 0 ${LOGO.width} ${LOGO.height}`} role="img" aria-label={title}>
      <Mark ink={ink} line={line} />
      <path d={LOGO.word} fill={ink} />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <Mark ink="var(--ink)" line="var(--accent)" />
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
          <stop offset="0" stopColor="#b2b8b5" />
          <stop offset="1" stopColor="#b2b8b5" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d={LOGO.word} fill="url(#fw-fade)" />
    </svg>
  );
}
