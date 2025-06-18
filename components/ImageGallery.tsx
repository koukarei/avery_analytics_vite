
import React, { useState, useRef, useEffect } from 'react';
import { ImageItem } from '../types';

interface ImageGalleryProps {
  images: ImageItem[];
  currentIndex: number; // Index of the first image in the triplet to display
  onScroll: (direction: 'up' | 'down') => void;
}

const ImagePanel: React.FC<{
  image: ImageItem | null;
  position: 'left' | 'center' | 'right';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ image, position, isHovered, onMouseEnter, onMouseLeave }) => {
  let transformClasses = 'transition-all duration-700 ease-in-out transform-gpu'; 
  let zIndex = 10;
  let opacityClass = 'opacity-100';

  // Adjusted 3D transforms to match the example image more closely
  switch (position) {
    case 'left':
      transformClasses += ' rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      zIndex = 5;
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
    case 'center':
      transformClasses += ' scale-100 translate-z-[20px]'; // Center panel pops slightly forward
      zIndex = 20;
      break;
    case 'right':
      transformClasses += ' -rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      zIndex = 5;
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
  }

  if (!image) {
    return (
      <div 
        className={`w-2/3 sm:w-1/2 md:w-1/3 aspect-[4/3] bg-neutral-700 rounded-lg shadow-2xl flex items-center justify-center ${transformClasses} ${opacityClass} border-2 border-neutral-600`}
        style={{ transformStyle: 'preserve-3d', zIndex }}
        aria-hidden="true"
      >
        {/* Empty panel placeholder */}
      </div>
    );
  }

  return (
    <div
      className={`w-2/3 sm:w-1/2 md:w-1/3 aspect-[4/3] bg-neutral-800 rounded-lg shadow-2xl overflow-hidden relative ${transformClasses} ${opacityClass} border-2 border-neutral-600 cursor-pointer group`}
      style={{ transformStyle: 'preserve-3d', zIndex }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter} 
      onBlur={onMouseLeave}  
      tabIndex={0} 
      role="img"
      aria-label={image.name}
    >
      <img src={image.url} alt={image.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105" />
      {(isHovered) && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
          <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center select-none">{image.name}</p>
        </div>
      )}
    </div>
  );
};

function useDebouncedCallback<A extends any[],>(
  callback: (...args: A) => void,
  wait: number
): (...args: A) => void {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args: A) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };

  return debouncedCallback;
}


export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, currentIndex, onScroll }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  const debouncedScroll = useDebouncedCallback(onScroll, 150);


  useEffect(() => {
    const currentGalleryRef = galleryRef.current;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault(); 
      if (Math.abs(event.deltaY) < 10) return; 
      if (event.deltaY > 0) {
        debouncedScroll('down'); 
      } else if (event.deltaY < 0) {
        debouncedScroll('up'); 
      }
    };

    currentGalleryRef?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      currentGalleryRef?.removeEventListener('wheel', handleWheel);
    };
  }, [debouncedScroll]);
  
  if (!images || images.length === 0) return null;
  
  // Ensure we always have 3 potential slots, even if images run out
  const leftImage = images[currentIndex] || null;
  const centerImage = images[currentIndex + 1] || null;
  const rightImage = images[currentIndex + 2] || null;

  return (
    <div 
      ref={galleryRef} 
      className="w-full h-full flex items-center justify-center space-x-[-15%] sm:space-x-[-12%] md:space-x-[-10%] relative" 
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      role="region"
      aria-label="Image Gallery"
    >
      <ImagePanel
        image={leftImage}
        position="left"
        isHovered={hoveredImageId === leftImage?.id}
        onMouseEnter={() => leftImage && setHoveredImageId(leftImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
      />
      <ImagePanel
        image={centerImage}
        position="center"
        isHovered={hoveredImageId === centerImage?.id}
        onMouseEnter={() => centerImage && setHoveredImageId(centerImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
      />
      <ImagePanel
        image={rightImage}
        position="right"
        isHovered={hoveredImageId === rightImage?.id}
        onMouseEnter={() => rightImage && setHoveredImageId(rightImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
      />
    </div>
  );
};