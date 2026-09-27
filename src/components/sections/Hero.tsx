import { useRef, useState } from 'react';
import { HeroGradient } from '@/components/ui/HeroGradient';
import { Icon } from '@/components/ui/Icon';
import { HERO } from '@/data/content';
import { CONTRACT_ADDRESS } from '@/data/site';

/** Token contract address with a one-click copy. */
function ContractAddress() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the address stays selectable */
    }
  };
  return (
    <div className="hero-ca">
      <span className="hero-ca-label">CA</span>
      <a
        className="hero-ca-addr"
        href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
        target="_blank"
        rel="noopener noreferrer"
        title={CONTRACT_ADDRESS}
      >
        {CONTRACT_ADDRESS}
      </a>
      <button type="button" className="hero-ca-copy" onClick={copy} aria-label={copied ? 'Contract address copied' : 'Copy contract address'}>
        <Icon name={copied ? 'check' : 'copy'} />
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

export function Hero() {
  return (
    <section className="section hero" id="top">
      <div className="container">
        <div className="hero-card">
          <HeroGradient />
          <div className="hero-text">
            <p className="eyebrow">{HERO.eyebrow}</p>
            <h1 className="h1">
              {HERO.title[0]}
              <br />
              {HERO.title[1]}
            </h1>
            <p className="p">{HERO.body}</p>
            <ContractAddress />
          </div>

          <div className="hero-stats">
            {HERO.stats.map((s) => (
              <div className="hero-stat" key={s.label} tabIndex={0}>
                <span className="tooltip" role="tooltip">
                  {s.tip}
                </span>
                <div className="hero-stat-label">
                  <p className="p muted">{s.label}</p>
                  <Icon name="info" />
                </div>
                <p className="hero-stat-value">{s.value}</p>
              </div>
            ))}
          </div>

          <a className="btn btn-ghost hero-scroll" href="#private-tx">
            {HERO.cta}
            <Icon name="chevron" />
          </a>
        </div>
      </div>
    </section>
  );
}
