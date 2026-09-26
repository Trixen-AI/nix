import { Fragment, type ReactNode } from 'react';
import { ArrowNE } from '@/components/ui/Icon';
import { DEV } from '@/data/content';

type Tok = [cls: '' | 'c' | 'k' | 's' | 'n' | 'f', text: string];

// Terminal session for zentry (the product's own command line tool).
const LINES: Tok[][] = [
  [['k', '$'], ['', ' zentry '], ['f', '--init'], ['', ' '], ['f', '--stealth']],
  [['s', '[ZEN]'], ['', ' Opening secure session on Solana...']],
  [['s', '[ZEN]'], ['', ' zk-SNARK circuits loaded '], ['c', '(3 circuits)']],
  [['s', '[ZEN]'], ['', ' Relay network: '], ['n', '24'], ['', ' nodes active']],
  [['s', '[ZEN]'], ['', ' Stealth mode: '], ['k', 'ENABLED']],
  [['s', '[ZEN]'], ['', ' Default tier: '], ['n', 'ENHANCED'], ['', ' (5 hops + zk)']],
  [['s', '[ZEN]'], ['', ' Ready for private transactions']],
  [],
  [['k', '$'], ['', ' zentry send '], ['f', '--to'], ['', ' Hn6W...c3R8 '], ['f', '--amount'], ['', ' '], ['n', '25'], ['', ' '], ['f', '--asset'], ['', ' USDC']],
  [['s', '[ZEN]'], ['', ' Proof generated locally '], ['c', '(1.8s)']],
  [['s', '[ZEN]'], ['', ' Routed through 5 relayers, commitment '], ['n', 'zk:7c1e...f0']],
  [['s', '[ZEN]'], ['', ' Settled. Nothing links origin to destination.']],
  [['k', '$'], ['', ' '], ['f', '_']],
];

function renderLine(tokens: Tok[]): ReactNode {
  return tokens.map(([cls, text], i) => (
    <Fragment key={i}>{cls ? <span className={`tok-${cls}`}>{text}</span> : text}</Fragment>
  ));
}

export function Developers() {
  return (
    <section className="section dev" id="developers">
      <div className="container">
        <div className="dev-head">
          <h2 className="display on-dark">
            <span className="text-gradient">{DEV.titleAccent} </span>
            {DEV.titleRest}
          </h2>
          <p className="p on-dark">{DEV.body}</p>
        </div>
        <div className="code-card" id="cli">
          <div className="code-head">
            <p className="p on-dark">{DEV.cardTitle}</p>
            <a className="btn btn-accent" href="#docs" target="_blank" rel="noopener noreferrer">
              {DEV.docs}
              <ArrowNE />
            </a>
          </div>
          <pre className="code-block" tabIndex={0}>
            <code>
              {LINES.map((line, i) => (
                <span className="code-line" key={i}>
                  <span className="code-ln">{i + 1}</span>
                  <span>{line.length ? renderLine(line) : ' '}</span>
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
