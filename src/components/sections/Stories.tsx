import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';
import { SiteLink } from '@/components/ui/SiteLink';
import { STORIES } from '@/data/content';

const TINTS: Record<string, string> = {
  orange:
    'radial-gradient(65% 90% at 12% 70%, #f98500 0%, rgba(249,133,0,0) 70%), radial-gradient(40% 60% at 30% 95%, #ffd6a8 0%, rgba(255,214,168,0) 70%), linear-gradient(120deg, #fff3e5 0%, #ffffff 50%, #f3f3f3 100%)',
  sky:
    'radial-gradient(60% 90% at 15% 65%, #bcefff 0%, rgba(188,239,255,0) 70%), radial-gradient(45% 60% at 85% 20%, #ffd6a8 0%, rgba(255,214,168,0) 70%), linear-gradient(120deg, #e6f8ff 0%, #ffffff 55%, #f3f3f3 100%)',
  mint:
    'radial-gradient(60% 90% at 15% 65%, #71cfa3 0%, rgba(113,207,163,0) 70%), radial-gradient(45% 60% at 85% 20%, #bcefff 0%, rgba(188,239,255,0) 70%), linear-gradient(120deg, #e3f6ec 0%, #ffffff 55%, #f3f3f3 100%)',
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
          <p className="eyebrow">{STORIES.eyebrow}</p>
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
                <SiteLink className="btn btn-dark" href={s.href}>
                  Open module
                </SiteLink>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
