import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroImage } from '@/data/homeContent';

interface HeroImageCarouselProps {
  images: HeroImage[];
  interval?: number;
}

const HeroImageCarousel = ({ images, interval = 5000 }: HeroImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotate
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900" />
    );
  }

  const currentSlideOverlay = currentIndex === 1 ? 'bg-black/0' : 'bg-black/10 md:bg-black/25';

  return (
    <div className="relative w-full h-full">
      {/* Imagens com transição fade */}
      {images.map((image, index) => (
        <div
          key={image.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          <img
            src={image.url}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === currentIndex ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay leve para legibilidade, totalmente transparente no segundo slide */}
      <div className={`absolute inset-0 ${currentSlideOverlay}`} />

      {/* Botões de navegação - apenas se tiver mais de 1 imagem */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Indicadores de slide (pontos) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroImageCarousel;
