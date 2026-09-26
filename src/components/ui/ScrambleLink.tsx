import { useRef, type ReactNode } from 'react';
import { ArrowNE } from './Icon';
import { SiteLink } from './SiteLink';

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const STEP_MS = 30;
const ROUNDS = 5;

type Props = { href: string; label: string; external?: boolean; className?: string; children?: ReactNode };

/** Footer link whose letters shuffle for a few frames on hover, then settle back. */
export function ScrambleLink({ href, label, external, className }: Props) {
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const run = () => {
    const el = textRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.clearInterval(timer.current);
    let frame = 0;
    const total = ROUNDS * 2;
    timer.current = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor((frame / total) * label.length);
      el.textContent = [...label]
        .map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join('');
      if (frame >= total) {
        window.clearInterval(timer.current);
        el.textContent = label;
      }
    }, STEP_MS);
  };

  return (
    <SiteLink href={href} external={external} className={className} onMouseEnter={run}>
      <span ref={textRef}>{label}</span>
      {external ? <ArrowNE /> : null}
    </SiteLink>
  );
}
