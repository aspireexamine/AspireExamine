import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { StreamCard } from './StreamCard';
import { Stream } from '@/types';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface StreamCarouselProps {
  streams: Stream[];
  onStreamSelect: (stream: Stream) => void;
}

export function StreamCarousel({ streams, onStreamSelect }: StreamCarouselProps) {
  return (
    <>
      <style>
        {`
          .mySwiper .swiper-pagination {
            bottom: -5px !important;
            z-index: 9999 !important;
            position: relative !important;
          }
          .mySwiper .swiper-pagination-bullet {
            background: #3b82f6 !important;
            opacity: 0.5 !important;
          }
          .mySwiper .swiper-pagination-bullet-active {
            opacity: 1 !important;
            background: #1d4ed8 !important;
          }
        `}
      </style>
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
      >
        {streams.map((stream) => (
          <SwiperSlide key={stream.id} onClick={() => onStreamSelect(stream)}>
            <StreamCard stream={stream} onClick={() => onStreamSelect(stream)} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}