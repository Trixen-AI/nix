import { HeroGradient } from '@/components/ui/HeroGradient';
import { Icon } from '@/components/ui/Icon';
import { HERO } from '@/data/content';

export function Hero() {
  return (
    <section className="section hero" id="top">
      <div className="container">
        <div className="hero-card">
          <HeroGradient />
          <div className="hero-top">
            <p className="eyebrow">{HERO.eyebrow}</p>
            <a className="btn btn-ghost hero-scroll" href="#private-tx">
              {HERO.cta}
              <Icon name="chevron" />
            </a>
          </div>

          <div className="hero-grid">
            <h1 className="h1 hero-title">
              {HERO.title[0]}
              <br />
              <span className="hero-title-accent">{HERO.title[1]}</span>
            </h1>
            <div className="hero-side">
              <p className="p hero-body">{HERO.body}</p>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
