import { Icon } from '@/components/ui/Icon';
import { MODULES } from '@/data/content';

// Six index cards on a fixed grid, each in one of the palette's card colours.
const TONES = ['orange', 'ink', 'mint', 'sky', 'mist', 'graphite'] as const;

export function Modules() {
  return (
    <section className="section" id="modules">
      <div className="container pb-default">
        <div className="section-head">
          <div className="section-head-title">
            <p className="eyebrow">{MODULES.eyebrow}</p>
            <h2 className="h2 tight">{MODULES.title}</h2>
          </div>
          <p className="p section-head-body">{MODULES.body}</p>
        </div>
        <div className="module-grid">
          {MODULES.cards.map((c, i) => (
            <article className={`module-card tone-${TONES[i % TONES.length]}`} key={c.n}>
              <div className="module-top">
                <span className="module-n">#{c.n}</span>
                <Icon name={c.icon} strokeWidth={1.4} />
              </div>
              <div className="module-copy">
                <h3 className="h4">{c.title}</h3>
                <p className="p-small">{c.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
