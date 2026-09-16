import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Icon } from '@/components/ui/Icon';
import { MODULES } from '@/data/content';

// Same breakpoints as the reference: 1 / 2 / 4 per view. Six cards, so desktop pages too.
const BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 8 },
  768: { slidesPerView: 2, spaceBetween: 16 },
  992: { slidesPerView: 4, spaceBetween: 24 },
};

export function Modules() {
  return (
    <section className="section" id="modules">
      <div className="container usecases-head">
        <h2 className="h2 tight">{MODULES.title}</h2>
        <p className="p">{MODULES.body}</p>
      </div>
      <div className="container pb-default usecases-clip">
        <Swiper
          className="swiper-usecases"
          modules={[Pagination]}
          breakpoints={BREAKPOINTS}
          pagination={{ el: '.usecases-pagination', clickable: true }}
        >
          {MODULES.cards.map((c) => (
            <SwiperSlide className="usecase-card" key={c.n}>
              <div className="usecase-top">
                <Icon name={c.icon} strokeWidth={1.2} />
                <span className="usecase-n">{c.n}</span>
              </div>
              <div className="copy">
                <h3 className="h4">{c.title}</h3>
                <p className="p-small muted">{c.body}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pill-row">
          <div className="swiper-pagination pill-pagination usecases-pagination" />
        </div>
      </div>
    </section>
  );
}
