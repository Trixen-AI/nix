import { Icon } from '@/components/ui/Icon';
import { SPLIT } from '@/data/content';

const FOCUS = 2;

function IntentPanel() {
  return (
    <div className="split-art intent-panel" aria-hidden="true">
      <div className="intent-list">
        {SPLIT.problem.rows.map((r, i) => {
          const d = Math.abs(i - FOCUS);
          const cls = d === 0 ? 'focus' : d === 1 ? 'near' : '';
          return (
            <div className={`intent-row ${cls}`} key={i}>
              <div>
                <small>{r.a[0]}</small>
                {r.a[1]}
              </div>
              {d === 0 ? (
                <span className="intent-go">
                  <Icon name="lock" strokeWidth={2} />
                </span>
              ) : (
                <span className="intent-dot" />
              )}
              <div>
                <small>{r.c[0]}</small>
                {r.c[1]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Original artwork: a wallet node whose path splits across relayer hops and exits as a proof.
const HOPS: [number, number][] = [
  [150, 90],
  [150, 180],
  [150, 270],
  [250, 60],
  [250, 150],
  [250, 225],
  [250, 300],
  [350, 110],
  [350, 250],
];
const LINKS: [number, number][] = [
  [0, 3],
  [0, 4],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 7],
  [5, 8],
  [6, 8],
];
const LIT = new Set([1, 4, 7]);
const MINT = '#7df0c0';
const DIM = '#2c3a35';

const curve = (a: [number, number], b: [number, number]) =>
  `M${a[0]} ${a[1]} C${a[0] + 50} ${a[1]} ${b[0] - 50} ${b[1]} ${b[0]} ${b[1]}`;

function RelayArt() {
  return (
    <div className="split-art left approve-art" aria-hidden="true">
      <svg viewBox="0 0 460 360" fill="none">
        {[0, 1, 2].map((i) => (
          <path key={`in${i}`} d={curve([74, 180], HOPS[i])} stroke={i === 1 ? MINT : DIM} strokeWidth={i === 1 ? 2.2 : 1.6} />
        ))}
        {LINKS.map(([a, b]) => {
          const lit = LIT.has(a) && LIT.has(b);
          return <path key={`${a}-${b}`} d={curve(HOPS[a], HOPS[b])} stroke={lit ? MINT : DIM} strokeWidth={lit ? 2.2 : 1.6} />;
        })}
        {[7, 8].map((i) => (
          <path key={`out${i}`} d={curve(HOPS[i], [396, 180])} stroke={i === 7 ? MINT : DIM} strokeWidth={i === 7 ? 2.2 : 1.6} />
        ))}
        {HOPS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#121816" stroke={LIT.has(i) ? MINT : '#34423d'} strokeWidth="1.6" />
            <circle cx={x} cy={y} r="3" fill={LIT.has(i) ? MINT : '#4b5a55'} />
          </g>
        ))}
        <rect x="26" y="156" width="48" height="48" rx="10" fill="#e9fbf2" />
        <path d="M50 164 L62 168 V177 C62 185 57 190.5 50 193.5 C43 190.5 38 185 38 177 V168 Z" fill="#0a0d0c" />
        <rect x="42" y="175" width="16" height="5" rx="1.5" fill={MINT} />
        <rect x="396" y="160" width="46" height="40" rx="8" fill={MINT} />
        <text x="419" y="185" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="13" fontWeight="600" fill="#0a0d0c">
          zk
        </text>
      </svg>
    </div>
  );
}

export function Split() {
  return (
    <section className="section">
      <div className="container pb-default split-stack">
        <div className="split">
          <div className="split-text">
            <div className="split-text-inner">
              <h3 className="h3">{SPLIT.problem.title}</h3>
              <p className="p muted">{SPLIT.problem.body}</p>
            </div>
          </div>
          <IntentPanel />
        </div>
        <div className="split reverse" id="security">
          <RelayArt />
          <div className="split-text dark">
            <div className="split-text-inner">
              <h3 className="h3 on-dark">{SPLIT.control.title}</h3>
              <p className="p on-dark">{SPLIT.control.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
