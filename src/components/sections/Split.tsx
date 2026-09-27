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

// "Nobody holds your keys but you": the key stays lit inside your device; relayers only ever
// carry sealed payloads, and what reaches the chain is the proof. Fills only, on the ink panel.
const INK = '#0a0a0b';
const PANEL = '#232323';
const ORANGE = '#f98500';
const SKY = '#bcefff';
const SKY_DEEP = '#8fd6ee';
const MINT = '#71cfa3';
const DIM = 'rgba(255, 255, 255, 0.5)';
const MONO = 'Martian Mono Variable, monospace';
const RELAYERS = [225, 290, 355];

function Relayer({ cx, n }: { cx: number; n: number }) {
  const ex = cx - 15;
  const ey = 175;
  return (
    <g>
      <rect x={cx - 24} y={153} width={48} height={64} rx={16} fill={PANEL} />
      <rect x={ex} y={ey} width={30} height={20} rx={3} fill={SKY} />
      <path d={`M${ex} ${ey} L${cx} ${ey + 11} L${ex + 30} ${ey} Z`} fill={SKY_DEEP} />
      <circle cx={cx} cy={ey + 11} r={3.5} fill={MINT} />
      <text x={cx} y={240} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={DIM}>
        R{n}
      </text>
    </g>
  );
}

function KeysArt() {
  return (
    <div className="split-art left approve-art" aria-hidden="true">
      <svg viewBox="0 0 460 360" fill="none">
        <line x1="170" y1="185" x2="398" y2="185" stroke="#3a3a3c" strokeWidth="1.2" strokeDasharray="4 6" />
        <text x="290" y="128" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={DIM}>
          SEALED PAYLOADS ONLY
        </text>

        {/* your device, with the key inside */}
        <rect x="40" y="90" width="130" height="190" rx="22" fill={PANEL} />
        <rect x="52" y="104" width="106" height="162" rx="14" fill={INK} />
        <rect x="90" y="111" width="30" height="5" rx="2.5" fill={PANEL} />
        <circle cx="105" cy="172" r="44" fill={ORANGE} opacity="0.16" />
        <circle cx="105" cy="150" r="16" fill={ORANGE} />
        <circle cx="105" cy="150" r="6" fill={INK} />
        <rect x="101" y="162" width="8" height="48" rx="3" fill={ORANGE} />
        <rect x="108" y="192" width="11" height="6" rx="2" fill={ORANGE} />
        <rect x="108" y="202" width="8" height="5" rx="2" fill={ORANGE} />
        <text x="105" y="305" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={DIM}>
          YOUR DEVICE
        </text>

        {RELAYERS.map((cx, i) => (
          <Relayer cx={cx} n={i + 1} key={cx} />
        ))}

        {/* what the chain receives */}
        <rect x="398" y="160" width="48" height="50" rx="14" fill={MINT} />
        <text x="422" y="190" textAnchor="middle" fontFamily={MONO} fontSize="12" fontWeight="600" fill={INK}>
          zk
        </text>
        <text x="422" y="240" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={DIM}>
          PROOF
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
              <div className="stack">
                <p className="eyebrow">{SPLIT.problem.eyebrow}</p>
                <h3 className="h3">{SPLIT.problem.title}</h3>
              </div>
              <p className="p muted">{SPLIT.problem.body}</p>
            </div>
          </div>
          <IntentPanel />
        </div>
        <div className="split reverse" id="security">
          <KeysArt />
          <div className="split-text dark">
            <div className="split-text-inner">
              <div className="stack">
                <p className="eyebrow on-dark-dim">{SPLIT.control.eyebrow}</p>
                <h3 className="h3 on-dark">{SPLIT.control.title}</h3>
              </div>
              <p className="p on-dark">{SPLIT.control.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
