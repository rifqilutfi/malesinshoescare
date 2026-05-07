import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  desc: string;
}

interface GalleryCarouselProps {
  images: GalleryImage[];
}

export default function GalleryCarousel({ images }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3; // Show 3 items at a time on desktop
  const maxIndex = Math.max(0, images.length - itemsPerPage);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={prev}
        disabled={currentIndex === 0}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white border-3 border-black p-3 shadow-brutal hover-lift disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={next}
        disabled={currentIndex >= maxIndex}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white border-3 border-black p-3 shadow-brutal hover-lift disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden px-2">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` }}
        >
          {images.map((image) => (
            <div 
              key={image.id} 
              className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)]"
            >
              <div className="bg-white border-brutal shadow-brutal-lg overflow-hidden group">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  {/* Placeholder - replace with real images */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {image.src === 'placeholder' ? '👟' : (
                      <img 
                        src={image.src} 
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{image.title}</h3>
                  <p className="text-gray-600 text-sm">{image.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full border-2 border-black transition-colors ${
              i === currentIndex ? 'bg-orange-500' : 'bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
