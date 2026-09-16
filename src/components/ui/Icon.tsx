import type { SVGProps } from 'react';

// Nix Shield's own line icons: 24-unit grid, 1.6 stroke, round caps.
const PATHS = {
  lock: 'M6.5 10.5h11v9.5h-11zM8.8 10.5V7.8a3.2 3.2 0 0 1 6.4 0v2.7M12 14.2v2.4',
  swirl: 'M20 8.5C17.5 5 12 4.2 8.6 6.8M4 15.5c2.5 3.5 8 4.3 11.4 1.7M17.5 12a5.5 5.5 0 0 0-8.3-4.7M6.5 12a5.5 5.5 0 0 0 8.3 4.7M12 12h.01',
  shield: 'M12 3.8 19 6.5v5.2c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6.5zM9.2 12l2 2 3.8-3.8',
  bridge: 'M3 16h18M5 16v-3a7 7 0 0 1 14 0v3M9 16v-2.5M15 16v-2.5M12 16v-3',
  bot: 'M5.5 9h13v9.5h-13zM12 9V5.5M12 5.5h.01M9.3 13.3v.9M14.7 13.3v.9M3 12.5v3M21 12.5v3',
  bolt: 'M13 3.5 5.5 13.5H12l-1 7 7.5-10H12z',
  grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
  chart: 'M4 4.5v15h15.5M8 15.5v-3M12 15.5V8.5M16 15.5v-5.5',
  ghost: 'M6 20V11a6 6 0 0 1 12 0v9l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5zM10 11h.01M14 11h.01',
  terminal: 'M4 5.5h16v13H4zM7.5 10l2.5 2-2.5 2M12 14h4',
  chevron: 'M7 10l5 5 5-5',
  info: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 11v5M12 7.8v.1',
  arrowLeft: 'M19 12H5m6-6-6 6 6 6',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  arrowNE: 'M7 17 17 7M8.5 7H17v8.5',
  check: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.2l2.6 2.6L16 9.4',
} as const;

export type IconName = keyof typeof PATHS;

type Props = SVGProps<SVGSVGElement> & { name: IconName; strokeWidth?: number };

export function Icon({ name, strokeWidth = 1.6, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function ArrowNE({ className = 'arrow-ne' }: { className?: string }) {
  return <Icon name="arrowNE" className={className} strokeWidth={2} />;
}
