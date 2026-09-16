import { useState } from 'react';
import { FooterWordmark } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';
import { ScrambleLink } from '@/components/ui/ScrambleLink';
import { FOOTER, FOOTER_LINE, type FooterGroup } from '@/data/content';

function Links({ group }: { group: FooterGroup }) {
  return (
    <div className="footer-links">
      {group.links.map((l) => (
        <ScrambleLink key={l.label} href={l.href} label={l.label} external={l.external} />
      ))}
    </div>
  );
}

const GROUPS = FOOTER.flat();

export function Footer() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <footer className="section footer">
      <div className="container">
        <div className="footer-line" />

        {/* Desktop and tablet: columns */}
        <div className="footer-grid">
          {FOOTER.map((col, i) => (
            <div className="footer-col" key={i}>
              {col.map((g) => (
                <div className="footer-col" key={g.title} style={{ gap: 16 }}>
                  <p className="footer-title">{g.title}</p>
                  <Links group={g} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Phone: accordions */}
        <div className="footer-acc">
          {GROUPS.map((g) => {
            const isOpen = open === g.title;
            const id = `acc-${g.title.toLowerCase()}`;
            return (
              <div className={`acc-item${isOpen ? ' is-open' : ''}`} key={g.title}>
                <button
                  type="button"
                  className="acc-toggle"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : g.title)}
                >
                  {g.title}
                  <Icon name="chevron" />
                </button>
                <div className="acc-panel" id={id}>
                  <div>
                    <Links group={g} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="footer-bottom">{FOOTER_LINE}</p>
        <FooterWordmark />
      </div>
    </footer>
  );
}
