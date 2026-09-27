import { SiteLink } from '@/components/ui/SiteLink';
import { APP_URL, TIERS } from '@/data/content';

type Card = (typeof TIERS.cards)[number];

const TONE: Record<string, string> = { Standard: 'mint', Enhanced: 'sky', Ghost: 'ink' };

/** YOU and THEM with one dot per relayer hop between them. */
function Route({ hops, delay }: { hops: number; delay: boolean }) {
  return (
    <div className={`tier-route${delay ? ' is-delay' : ''}`} aria-hidden="true">
      <span className="tier-end">YOU</span>
      <span className="tier-hops">
        {Array.from({ length: hops }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <span className="tier-end">THEM</span>
    </div>
  );
}

function TierCard({ c }: { c: Card }) {
  const { hops, time, zk, delay, amount } = c.mock;
  return (
    <SiteLink className={`tier-card tone-${TONE[c.label] ?? 'mist'}`} href={`${APP_URL}?tier=${c.label.toLowerCase()}`}>
      <div className="tier-card-top">
        <span className="tier-chip">{c.label}</span>
        <span className="tier-time">{time}</span>
      </div>
      <p className="tier-big">
        <span className="tier-num">{hops}</span>
        <span className="tier-unit">hops</span>
      </p>
      <Route hops={hops} delay={delay} />
      <dl className="tier-specs">
        <div>
          <dt>Proof</dt>
          <dd>{zk ? 'zk-SNARK' : 'None'}</dd>
        </div>
        <div>
          <dt>Timing</dt>
          <dd>{delay ? 'Random delay' : 'Direct'}</dd>
        </div>
        <div>
          <dt>Example</dt>
          <dd>{amount} USDC</dd>
        </div>
      </dl>
      <div className="tier-copy">
        <h3 className="h4">{c.title}</h3>
        <p className="p-small">{c.body}</p>
      </div>
      <span className="tier-cta">
        Use {c.label}
        <span className="arr">→</span>
      </span>
    </SiteLink>
  );
}

export function Tiers() {
  return (
    <section className="section" id="private-tx">
      <div className="container pb-default">
        <div className="section-head">
          <div className="section-head-title">
            <p className="eyebrow">{TIERS.eyebrow}</p>
            <h2 className="h2 tight">{TIERS.title}</h2>
          </div>
          <p className="p muted section-head-body">{TIERS.body}</p>
        </div>
        <div className="tier-grid">
          {TIERS.cards.map((c) => (
            <TierCard c={c} key={c.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
