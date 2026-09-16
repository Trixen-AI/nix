import { Fragment, type ReactNode } from 'react';
import { ArrowNE } from '@/components/ui/Icon';
import { DEV } from '@/data/content';

type Tok = [cls: '' | 'c' | 'k' | 's' | 'n' | 'f', text: string];

// Terminal session for nixshield (the product's own command line tool).
const LINES: Tok[][] = [
  [['k', '$'], ['', ' nixshield '], ['f', '--init'], ['', ' '], ['f', '--stealth']],
  [['s', '[NIX]'], ['', ' Opening secure session...']],
  [['s', '[NIX]'], ['', ' zk-SNARK circuits loaded '], ['c', '(3 circuits)']],
  [['s', '[NIX]'], ['', ' Relay network: '], ['n', '24'], ['', ' nodes active']],
  [['s', '[NIX]'], ['', ' Stealth mode: '], ['k', 'ENABLED']],
  [['s', '[NIX]'], ['', ' Default tier: '], ['n', 'ENHANCED'], ['', ' (5 hops + zk)']],
  [['s', '[NIX]'], ['', ' Ready for private transactions']],
  [],
  [['k', '$'], ['', ' nixshield send '], ['f', '--to'], ['', ' 0x71fa...c3b8 '], ['f', '--amount'], ['', ' '], ['n', '25'], ['', ' '], ['f', '--asset'], ['', ' USDC']],
  [['s', '[NIX]'], ['', ' Proof generated locally '], ['c', '(1.8s)']],
  [['s', '[NIX]'], ['', ' Routed through 5 relayers, commitment '], ['n', 'zk:7c1e...f0']],
  [['s', '[NIX]'], ['', ' Settled. Nothing links origin to destination.']],
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
