import { HeroGradient } from '@/components/ui/HeroGradient';
import { Icon } from '@/components/ui/Icon';
import { HERO } from '@/data/content';

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
