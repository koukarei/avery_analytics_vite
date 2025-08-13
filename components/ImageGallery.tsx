
import React, { useState, useRef, useEffect } from 'react';
import type { ImageItem } from '../types/gallery';
import type { Leaderboard } from '../types/leaderboard';

interface ImageGalleryProps {
  leaderboards: Leaderboard[];
  currentIndex: number; // Index of the first image in the triplet to display
  onScroll: (direction: 'up' | 'down') => void;
}

interface ImagePanelProps {
  image: ImageItem | null;
  position: 'left' | 'center' | 'right';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void; // Added for click navigation
}

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  leaderboard, 
  position, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  onClick 
}) => {
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

  if (!leaderboard) {
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
      onClick={onClick} // Added onClick handler
      tabIndex={onClick ? 0 : -1} // Make clickable items focusable
      role="button" // Role implies clickability
      aria-label={onClick ? `Navigate to ${position === 'left' ? 'previous' : 'next'} image: ${leaderboard.ti.name}` : image.name}
      onKeyDown={(e) => { // Allow activation with Enter/Space for accessibility
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
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

function useDebouncedCallback<A extends unknown[],>(
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
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false); // To distinguish tap from swipe

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

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX.current = event.targetTouches[0].clientX;
      touchEndX.current = event.targetTouches[0].clientX; // Initialize touchEnd
      isSwiping.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartX.current) return;
      touchEndX.current = event.targetTouches[0].clientX;
      // If significant horizontal movement, consider it a swipe
      if (Math.abs(touchEndX.current - touchStartX.current) > 10) {
          isSwiping.current = true;
          // Optionally prevent vertical scroll if horizontal swipe is detected
          // event.preventDefault(); 
      }
    };

    const handleTouchEnd = () => {
      if (!touchStartX.current || !isSwiping.current) { // Only process if it was a swipe
        touchStartX.current = 0;
        touchEndX.current = 0;
        return;
      }

      const swipeThreshold = 50; // Minimum pixels for a swipe
      const dx = touchEndX.current - touchStartX.current;

      if (Math.abs(dx) > swipeThreshold) {
        if (dx > 0) { // Swipe Right (towards larger X values)
          debouncedScroll('up'); // Previous
        } else { // Swipe Left
          debouncedScroll('down'); // Next
        }
      }
      touchStartX.current = 0;
      touchEndX.current = 0;
      isSwiping.current = false;
    };

    currentGalleryRef?.addEventListener('wheel', handleWheel, { passive: false });
    currentGalleryRef?.addEventListener('touchstart', handleTouchStart, { passive: true });
    currentGalleryRef?.addEventListener('touchmove', handleTouchMove, { passive: true }); // passive true to allow page scroll unless we preventDefault
    currentGalleryRef?.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      currentGalleryRef?.removeEventListener('wheel', handleWheel);
      currentGalleryRef?.removeEventListener('touchstart', handleTouchStart);
      currentGalleryRef?.removeEventListener('touchmove', handleTouchMove);
      currentGalleryRef?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [debouncedScroll]);
  
  if (!images || images.length === 0) return null;
  
  // Ensure we always have 3 potential slots, even if images run out
  const leftImage = images[currentIndex] || null;
  const centerImage = images[(currentIndex + 1) % images.length] || null;
  const rightImage = images[(currentIndex + 2) % images.length] || null;

  return (
    <div 
      ref={galleryRef} 
      className="w-full h-1/2 flex items-center justify-center space-x-[-5%] sm:space-x-[-2%] md:space-x-[-1%] relative" 
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      role="region"
      aria-label="Leaderboard"
    >
      <ImagePanel
        image={leftImage}
        position="left"
        isHovered={hoveredImageId === leftImage?.id}
        onMouseEnter={() => leftImage && setHoveredImageId(leftImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
        onClick={leftImage ? () => debouncedScroll('up') : undefined}
      />
      <ImagePanel
        image={centerImage}
        position="center"
        isHovered={hoveredImageId === centerImage?.id}
        onMouseEnter={() => centerImage && setHoveredImageId(centerImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
        // No onClick for navigation on the center panel
      />
      <ImagePanel
        image={rightImage}
        position="right"
        isHovered={hoveredImageId === rightImage?.id}
        onMouseEnter={() => rightImage && setHoveredImageId(rightImage.id)}
        onMouseLeave={() => setHoveredImageId(null)}
        onClick={rightImage ? () => debouncedScroll('down') : undefined}
      />
    </div>
  );
};