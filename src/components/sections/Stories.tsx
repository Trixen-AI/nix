import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';
import { SiteLink } from '@/components/ui/SiteLink';
import { STORIES } from '@/data/content';

const TINTS: Record<string, string> = {
  violet:
    'radial-gradient(65% 90% at 12% 70%, #a586ff 0%, rgba(165,134,255,0) 70%), radial-gradient(40% 60% at 30% 95%, #d9ccff 0%, rgba(217,204,255,0) 70%), linear-gradient(120deg, #f1ecff 0%, #fbfaff 50%, #f0f0f4 100%)',
  fog:
    'radial-gradient(60% 90% at 15% 65%, #d6d6e0 0%, rgba(214,214,224,0) 70%), radial-gradient(45% 60% at 85% 20%, #e3d9ff 0%, rgba(227,217,255,0) 70%), linear-gradient(120deg, #f0f0f4 0%, #fbfbfd 55%, #f3f0fb 100%)',
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
