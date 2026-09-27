import { Fragment, useState, type ReactNode } from 'react';
import { ArrowNE } from '@/components/ui/Icon';
import { DEV } from '@/data/content';

type Tok = [cls: '' | 'c' | 'k' | 's' | 'n' | 'f', text: string];
type Session = { key: string; n: string; label: string; hint: string; lines: Tok[][] };

// The zksona CLI, one sample session per command. Pick a command on the left to see its output.
const SESSIONS: Session[] = [
  {
    key: 'init',
    n: '01',
    label: 'Open a session',
    hint: 'Load the circuits and join the relayers.',
    lines: [
      [['k', '$'], ['', ' zksona init '], ['f', '--sealed']],
      [['s', 'zks'], ['', ' opening a sealed session on Solana']],
      [['s', 'zks'], ['', ' circuits ready '], ['c', '(3 loaded)']],
      [['s', 'zks'], ['', ' relayers online: '], ['n', '24']],
      [['s', 'zks'], ['', ' default tier: '], ['n', 'enhanced'], ['c', ' (5 hops + proof)']],
      [['s', 'zks'], ['', ' ready']],
    ],
  },
  {
    key: 'send',
    n: '02',
    label: 'Send privately',
    hint: 'One signature, proof built on your machine.',
    lines: [
      [['k', '$'], ['', ' zksona send '], ['f', '--to'], ['', ' Hn6W...c3R8 '], ['f', '--amount'], ['', ' '], ['n', '25'], ['', ' '], ['f', '--asset'], ['', ' USDC']],
      [['s', 'zks'], ['', ' proof built locally '], ['c', '(1.8s)']],
      [['s', 'zks'], ['', ' 5 relayer hops, commitment '], ['n', 'zk:7c1e...f0']],
      [['s', 'zks'], ['', ' settled. nothing links sender to receiver']],
    ],
  },
  {
    key: 'vault',
    n: '03',
    label: 'Lock in the vault',
    hint: 'Sealed balance, release date you choose.',
    lines: [
      [['k', '$'], ['', ' zksona vault lock '], ['f', '--amount'], ['', ' '], ['n', '40'], ['', ' '], ['f', '--asset'], ['', ' USDC '], ['f', '--until'], ['', ' 2026-12-31']],
      [['s', 'zks'], ['', ' commitment written '], ['n', 'vault:3e9a...21']],
      [['s', 'zks'], ['', ' balance sealed until '], ['n', '2026-12-31']],
      [['s', 'zks'], ['', ' only your key can release it']],
    ],
  },
  {
    key: 'scan',
    n: '04',
    label: 'Scan exposure',
    hint: 'What your public history gives away.',
    lines: [
      [['k', '$'], ['', ' zksona agent '], ['f', '--scan'], ['', ' 7xKq...9fPd']],
      [['s', 'zks'], ['', ' read '], ['n', '100'], ['', ' transactions']],
      [['s', 'zks'], ['', ' linked addresses '], ['n', '13'], ['c', ' (3 repeat)']],
      [['s', 'zks'], ['', ' exposure '], ['n', '68/100'], ['', ', suggested tier '], ['n', 'ghost']],
    ],
  },
];

function renderLine(tokens: Tok[]): ReactNode {
  return tokens.map(([cls, text], i) => (
    <Fragment key={i}>{cls ? <span className={`tok-${cls}`}>{text}</span> : text}</Fragment>
  ));
}

export function Developers() {
  const [active, setActive] = useState(SESSIONS[0].key);
  const session = SESSIONS.find((s) => s.key === active) ?? SESSIONS[0];

  return (
    <section className="section dev" id="developers">
      <div className="container">
        <div className="dev-head">
          <p className="eyebrow on-dark-dim">{DEV.eyebrow}</p>
          <h2 className="display on-dark">
            <span className="text-gradient">{DEV.titleAccent} </span>
            {DEV.titleRest}
          </h2>
          <p className="p on-dark">{DEV.body}</p>
        </div>

        <div className="cli" id="cli">
          <div className="cli-steps" role="tablist" aria-label="CLI commands">
            {SESSIONS.map((s) => (
              <button
                type="button"
                role="tab"
                key={s.key}
                id={`cli-tab-${s.key}`}
                aria-selected={s.key === active}
                aria-controls="cli-output"
                className={`cli-step${s.key === active ? ' is-on' : ''}`}
                onClick={() => setActive(s.key)}
              >
                <span className="cli-step-n">{s.n}</span>
                <span className="cli-step-text">
                  <span className="cli-step-label">{s.label}</span>
                  <span className="cli-step-hint">{s.hint}</span>
                </span>
              </button>
            ))}
            <a className="btn btn-accent cli-docs" href="#docs" target="_blank" rel="noopener noreferrer">
              {DEV.docs}
              <ArrowNE />
            </a>
          </div>

          <div className="cli-window">
            <div className="cli-bar">
              <span className="cli-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="cli-title">{DEV.cardTitle}</span>
            </div>
            <pre className="cli-body" id="cli-output" role="tabpanel" aria-labelledby={`cli-tab-${session.key}`} tabIndex={0} key={session.key}>
              <code>
                {session.lines.map((line, i) => (
                  <span className="cli-line" key={i} style={{ animationDelay: `${i * 90}ms` }}>
                    {renderLine(line)}
                  </span>
                ))}
                <span className="cli-line cli-cursor" style={{ animationDelay: `${session.lines.length * 90}ms` }}>
                  <span className="tok-k">$</span> <span className="cli-caret" />
                </span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
