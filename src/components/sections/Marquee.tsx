import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { loadProtocolLogos, type ProtocolLogo } from '@/data/logos';

// Logo strip: the list is rendered twice and the track slides by exactly one copy (30s, linear).
export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<ProtocolLogo[]>([]);

  useEffect(() => {
    let alive = true;
    loadProtocolLogos().then((l) => alive && setLogos(l));
    return () => {
      alive = false;
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || logos.length === 0) return;
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const dup = track.children[Math.ceil(9 / logos.length) * logos.length] as HTMLElement | undefined;
      if (first && dup) track.style.setProperty('--marquee-distance', `${dup.offsetLeft - first.offsetLeft}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [logos]);

  // Repeat short lists so one copy is wider than the viewport, then render that copy twice.
  const base = logos.length ? Array.from({ length: Math.ceil(9 / logos.length) }, () => logos).flat() : [];
  const items = [...base, ...base];

  return (
    <section className="section" id="chains" aria-label="Built on Solana">
      <div className="container marquee">
        <div className="marquee-mask">
          <div className="marquee-track" ref={trackRef}>
            {items.map((l, i) => (
              <div
                className="marquee-logo"
                key={`${l.key}-${i}`}
                role={i < logos.length ? 'img' : undefined}
                aria-label={i < logos.length ? l.name : undefined}
                aria-hidden={i >= logos.length || undefined}
                style={{ height: l.height }}
                dangerouslySetInnerHTML={{ __html: l.svg }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
