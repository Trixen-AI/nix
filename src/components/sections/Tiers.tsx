import { Icon } from '@/components/ui/Icon';
import { APP_URL, TIERS } from '@/data/content';

type Mock = (typeof TIERS.cards)[number]['mock'];

// Private transaction form preview, one per privacy tier.
function TxMock({ mock, label }: { mock: Mock; label: string }) {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-panel">
        <div className="mock-row">
          <span>Origin</span>
          <span>Destination</span>
        </div>
        <div className="mock-row mono">
          <span>0x3a...e19c</span>
          <span>0x••••••••</span>
        </div>
        <div className="mock-divider" />
        <div className="mock-row">
          <span>Amount</span>
          <span className="mock-chip">
            <i />
            USDC
          </span>
        </div>
        <div className="mock-row">
          <strong>{mock.amount}</strong>
        </div>
      </div>
      <div className="mock-hops">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < mock.hops ? 'on' : ''} />
        ))}
      </div>
      <div className="mock-meta">
        <span className="mock-tag">
          <Icon name={mock.delay ? 'ghost' : mock.zk ? 'lock' : 'shield'} />
          {label}
        </span>
        <span>{mock.zk ? 'zk proof' : 'no proof'}</span>
        <span>{mock.time}</span>
      </div>
      <div className="mock-btn">Execute private TX</div>
    </div>
  );
}

export function Tiers() {
  return (
    <section className="section" id="private-tx">
      <div className="container pb-default">
        <div className="frame">
          <div className="frame-title">
            <h2 className="h2 tight">{TIERS.title}</h2>
            <p className="p muted">{TIERS.body}</p>
          </div>
          <div className="action-cards">
            {TIERS.cards.map((c) => (
              <a className="glass-card" href={APP_URL} key={c.label}>
                <TxMock mock={c.mock} label={c.label} />
                <div className="action-copy">
                  <h3 className="card-label">
                    {c.label}
                    <span className="arr">→</span>
                  </h3>
                  <h4 className="h4">{c.title}</h4>
                  <p className="p">{c.body}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
