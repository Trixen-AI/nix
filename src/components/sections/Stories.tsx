import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';
import { APP_URL, STORIES } from '@/data/content';

const TINTS: Record<string, string> = {
  mint:
    'radial-gradient(65% 90% at 12% 70%, #7df0c0 0%, rgba(125,240,192,0) 70%), radial-gradient(40% 60% at 30% 95%, #c9f8e3 0%, rgba(201,248,227,0) 70%), linear-gradient(120deg, #ecfbf4 0%, #fbfdfc 50%, #eef1f6 100%)',
  fog:
    'radial-gradient(60% 90% at 15% 65%, #cfd8e6 0%, rgba(207,216,230,0) 70%), radial-gradient(45% 60% at 85% 20%, #c9f8e3 0%, rgba(201,248,227,0) 70%), linear-gradient(120deg, #eef2f7 0%, #fbfcfd 55%, #eef3f1 100%)',
};

// Reference: loop, one slide per view, pill pagination and round arrows.
const BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 8 },
  768: { slidesPerView: 1, spaceBetween: 16 },
  992: { slidesPerView: 1, spaceBetween: 24 },
};

export function Stories() {
  return (
    <section className="section" id="prompts">
      <div className="container stories">
        <div className="stories-head">
          <h2 className="h2">{STORIES.title}</h2>
          <p className="p">{STORIES.body}</p>
        </div>
        <div className="stories-controls">
          <button type="button" className="round-btn stories-prev" aria-label="Previous">
            <Icon name="arrowLeft" strokeWidth={2} />
          </button>
          <div className="swiper-pagination pill-pagination stories-pagination" />
          <button type="button" className="round-btn stories-next" aria-label="Next">
            <Icon name="arrowRight" strokeWidth={2} />
          </button>
        </div>
        <Swiper
          modules={[Navigation, Pagination]}
          loop
          breakpoints={BREAKPOINTS}
          navigation={{ prevEl: '.stories-prev', nextEl: '.stories-next' }}
          pagination={{ el: '.stories-pagination', clickable: true }}
        >
          {STORIES.slides.map((s) => (
            <SwiperSlide className="story" key={s.title}>
              <div className="story-art" style={{ background: TINTS[s.tint] }}>
                <div className="story-lockup">
                  <Logo />
                  <i className="sep" />
                  <span>{s.tag}</span>
                </div>
              </div>
              <div className="story-text">
                <div className="stack">
                  <h3 className="h3">{s.title}</h3>
                  <p className="p">{s.body}</p>
                  <p className="story-prompt">{s.prompt}</p>
                </div>
                <a className="btn btn-dark" href={APP_URL}>
                  Open module
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
