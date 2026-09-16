// Swiper 8 ships its typings outside its package "exports", so bundler resolution can't find them.
// Re-type the two modules we use from the React entry (which does resolve).
type SwiperModuleType = NonNullable<import('swiper/react').SwiperProps['modules']>[number];

declare module 'swiper' {
  export const Navigation: SwiperModuleType;
  export const Pagination: SwiperModuleType;
}

declare module 'swiper/css';
declare module 'swiper/css/pagination';
