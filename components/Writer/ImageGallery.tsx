/** @jsxImportSource @emotion/react */

import React, { useState, useRef, useEffect, useContext, Dispatch, SetStateAction } from 'react';
import { css } from "@emotion/react";
import type { Leaderboard } from '../../types/leaderboard';
import type { GalleryView } from '../../types/ui';
import type { Theme } from "@mui/material/styles";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Alert, Button } from '@mui/material';
import {theme} from "../../src/Theme";
import { useLocalization } from '../../contexts/localizationUtils';
import { LoadingImagePanel } from '../Common/LoadingImage';
import { ErrorDisplay } from '../Common/ErrorDisplay';
import { LeaderboardImageContext, LeaderboardImageProvider } from '../../providers/LeaderboardProvider';
import { RandomLeaderboardContext } from '../../providers/randomLeaderboardProvider';

interface ImageGalleryProps {
  view: GalleryView;
  setView: (view: GalleryView) => void;
  leaderboards: Leaderboard[];
  currentIndex: number; // Index of the first image in the triplet to display
  n_leaderboards: number;
  setCurrentLeaderboard: (leaderboard: Leaderboard | null) => void;
  setCurrentImageUrl: (url: string) => void;
  onScroll: (direction: 'up' | 'down') => void;
  randomLeaderboard: boolean;
}

interface ImagePanelProps {
  leaderboard: Leaderboard | null;
  position: 'left' | 'center' | 'right';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void; // Added for click navigation
  setCurrentImageUrl: (url: string) => void;
  loadedImageUrls: ImageUrlMap;
  setLoadedImageUrls: Dispatch<SetStateAction<ImageUrlMap>>;
  randomLeaderboard: boolean;
}

interface ImageUrlMap {
  [key: number]: string;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  leaderboard, 
  position, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  onClick,
  setCurrentImageUrl,
  loadedImageUrls,
  setLoadedImageUrls,
  randomLeaderboard
}) => {
  const { t } = useLocalization();
  const { loading, fetchImage } = useContext(LeaderboardImageContext);
  const [ errorKey, setErrorKey ] = useState<string | null>(null);
  const [ loadedImageUrl, setLoadedImageUrl ] = useState<string | null>(null);
  const [ warningMsg, setWarningMsg ] = useState<string>('');
  const [ displayText, setDisplayText ] = useState<string>('');
  
  const { unfinishedLeaderboards, shuffleLeaderboards } = useContext(RandomLeaderboardContext);
  const isFetchingRef = useRef<boolean>(false);
  
  let transformClasses = 'transition-all duration-700 ease-in-out transform-gpu'; 
  let opacityClass = 'opacity-100';

  // Adjusted 3D transforms to match the example image more closely
  switch (position) {
    case 'left':
      transformClasses += ' rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
    case 'center':
      transformClasses += ' scale-100 translate-z-[20px]'; // Center panel pops slightly forward
      break;
    case 'right':
      transformClasses += ' -rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
  }

  
  useEffect(() => {
    if (isFetchingRef.current) return; // Prevent duplicate fetches

    if (!leaderboard) {
      setLoadedImageUrl(null);
      return;
    }

    // If we've already cached the URL in the parent map, use it and don't fetch.
    const cached = loadedImageUrls[leaderboard.id];
    if (cached) {
      setLoadedImageUrl(cached);
      return;
    }

    const loadImage = async () => {
      isFetchingRef.current = true;
      setErrorKey(null);
      try {
        const fetchedImage = await fetchImage(leaderboard.id);
        setLoadedImageUrl(fetchedImage);
        if (fetchedImage) {
          // use functional update to avoid stale-map races
          setLoadedImageUrls(prev => ({ ...prev, [leaderboard.id]: fetchedImage }));
        }
      } catch (err) {
        setErrorKey('error.fetch_leaderboard_image');
        console.error("Failed to fetch leaderboard image: ", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    loadImage();
  }, [leaderboard, loadedImageUrls, fetchImage]);
  
  
  useEffect(() => {
    if (!leaderboard) {
      setDisplayText('');
      return;
    }

    if (randomLeaderboard) {
      const isUnfinished = unfinishedLeaderboards.find(ulb => ulb.leaderboard_id === leaderboard.id);
      const clickable = shuffleLeaderboards.find(lb => lb.leaderboard_id === leaderboard.id)?.started;
      if (!clickable) {
        setDisplayText(t('writerView.writingPage.not_yet_available'));
        return;
      }
      setDisplayText(isUnfinished ? t('writerView.writingPage.start') : t('writerView.writingPage.continue'));
      return;
    }

    // non-random behavior: center uses "start", sides display title
    setDisplayText(position === "center" ? t('writerView.writingPage.start') : leaderboard.title);
  }, [leaderboard, position, randomLeaderboard, unfinishedLeaderboards, t]);

  if (!leaderboard) {
    return (
      <div 
        className={`w-2/3 sm:w-1/2 md:w-1/3 aspect-[4/3] bg-neutral-700 rounded-lg shadow-2xl flex items-center justify-center ${transformClasses} border-2 border-neutral-600`}
        style={{ transformStyle: 'preserve-3d' }}
        aria-hidden="true"
      >
        {/* Empty panel placeholder */}
      </div>
    );
  }

  const handleOnClick = () => {
    if (randomLeaderboard) {
      if (shuffleLeaderboards.find(ulb => ulb.leaderboard_id === leaderboard.id)?.started) {
        if (loadedImageUrl) {
          setCurrentImageUrl(loadedImageUrl);
        }
        if (onClick) {
          onClick();
        }
      }
      return;
    }

    if (loadedImageUrl) {
      setCurrentImageUrl(loadedImageUrl);
    }
    if (onClick) {
      onClick();
    }
  };
    
    const renderContent = () => {
      if (loading) {
        return <LoadingImagePanel position={position} />;
      }
      if (errorKey) {
        return <ErrorDisplay messageKey={errorKey} />;
      }
  
      return (
        <div
          className={`w-2/3 sm:w-1/2 md:w-1/3 aspect-[4/3] cursor-pointer group`}
          style={{
            transformStyle: 'preserve-3d',
            // visual stacking and pointer behavior:
            zIndex: position === 'center' ? 60 : 40,
            // if center should not intercept clicks except when hovered/focused:
            pointerEvents: 'auto'
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onMouseEnter} 
          onBlur={onMouseLeave}  
          onClick={handleOnClick} // Added onClick handler
          tabIndex={onClick ? 0 : -1} // Make clickable items focusable
          role="button" // Role implies clickability
          aria-label={onClick ? `Navigate to ${position === 'left' ? 'previous' : 'next'} image: ${leaderboard.title}` : leaderboard.title}
          onKeyDown={(e) => { // Allow activation with Enter/Space for accessibility
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleOnClick();
            }
          }}
        >
          <div className={`w-full h-full border-2 border-neutral-600 bg-neutral-800 rounded-lg shadow-2xl overflow-hidden relative ${transformClasses} ${opacityClass}`}>
            {loadedImageUrl ? (
              <img 
                src={loadedImageUrl}
                onError={() => setWarningMsg(t('galleryView.galleryPage.warning.load_failed'))}
                onLoad={() => setWarningMsg('')}
                alt={leaderboard?.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-400">
                {/* Placeholder when image URL is not yet available */}
                <span>{t('galleryView.galleryPage.placeholder') || ''}</span>
              </div>
            )}
            {warningMsg && (
              <Alert severity="warning" className="absolute bottom-2 left-2 right-2">{warningMsg}</Alert>
            )}
            <div className="absolute top-0 right-0 m-2">
                <span css={sceneStyles(theme)} className="inline-block bg-cyan-500 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                {leaderboard.scene.name}
              </span>
            </div>
            
            {(isHovered || (randomLeaderboard && !shuffleLeaderboards.find(lb => lb.leaderboard_id === leaderboard.id)?.started)) && (
              <div className="absolute inset-0 bg-black opacity-60 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
                <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center select-none">
                  {displayText}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    };
    
    return (
      <>
        {renderContent()}
      </>
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


export const ImageGallery: React.FC<ImageGalleryProps> = (
  { setView, leaderboards, currentIndex, n_leaderboards, setCurrentLeaderboard, setCurrentImageUrl, onScroll, randomLeaderboard }
) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [ loadedImageUrls, setLoadedImageUrls ] = useState<ImageUrlMap>({});
  const [ hoveredImageId, setHoveredImageId ] = useState<number | null>(null);

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

  if (!leaderboards || leaderboards.length === 0) return null;

  // Ensure we always have 3 potential slots, even if images run out
  const leftImage = leaderboards[(currentIndex - 1 + n_leaderboards) % n_leaderboards] || null;
  const centerImage = leaderboards[currentIndex % n_leaderboards] || null;
  const rightImage = leaderboards[(currentIndex + 1) % n_leaderboards] || null;
  
  return (
    <div 
      ref={galleryRef} 
      className="w-full h-full" 
      role="region"
      aria-label="Leaderboard"
    >
      <Button
        aria-label="Previous"
        onClick={() => debouncedScroll('up')}
        css={arrowStyles('left')}
      >
        <ArrowBackIosIcon />
      </Button>
      <div
        className="w-full h-full flex items-start justify-center space-x-[-5%] sm:space-x-[-2%] md:space-x-[-1%] relative"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <LeaderboardImageProvider>
          <ImagePanel
            leaderboard={leftImage}
            setCurrentImageUrl={setCurrentImageUrl}
            loadedImageUrls={loadedImageUrls}
            setLoadedImageUrls={setLoadedImageUrls}
            position="left"
            isHovered={hoveredImageId === leftImage?.id}
            onMouseEnter={() => leftImage && setHoveredImageId(leftImage.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={leftImage ? () => {
              debouncedScroll('up')
              setCurrentLeaderboard(leftImage);
              setView('detail');
            } : undefined}
            randomLeaderboard={randomLeaderboard}
          />
          <ImagePanel
            leaderboard={centerImage}
            setCurrentImageUrl={setCurrentImageUrl}
            loadedImageUrls={loadedImageUrls}
            setLoadedImageUrls={setLoadedImageUrls}
            position="center"
            isHovered={hoveredImageId === centerImage?.id}
            onMouseEnter={() => centerImage && setHoveredImageId(centerImage.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={centerImage ? () => {
              setView('detail')
              setCurrentLeaderboard(centerImage);
            } : undefined}
            randomLeaderboard={randomLeaderboard}
          />
          <ImagePanel
            leaderboard={rightImage}
            setCurrentImageUrl={setCurrentImageUrl}
            loadedImageUrls={loadedImageUrls}
            setLoadedImageUrls={setLoadedImageUrls}
            position="right"
            isHovered={hoveredImageId === rightImage?.id}
            onMouseEnter={() => rightImage && setHoveredImageId(rightImage.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={rightImage ? () => {
              debouncedScroll('down')
              setCurrentLeaderboard(rightImage);
              setView('detail');
            } : undefined}
            randomLeaderboard={randomLeaderboard}
          />
        </LeaderboardImageProvider>
      </div>
      <Button
        aria-label="Next"
        onClick={() => debouncedScroll('down')}
        css={arrowStyles('right')}
      >
        <ArrowForwardIosIcon />
      </Button>
    </div>
  );
};

const sceneStyles = (theme: Theme) => css`
  background-color: ${theme.palette.primary.dark};
  color: ${theme.palette.primary.contrastText};
`;

const arrowStyles = (position: 'left' | 'right') => css`
  position: absolute;
  top: 40%;
  ${position}: 0;
  height: 100%;
  transform: translateY(-50%);
  z-index: 100;
  color: white;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`
