
import React, { useState, useRef, useContext, useEffect } from 'react';
import type { Leaderboard, LeaderboardAnalysis, Scene } from '../../types/leaderboard';
import type { GalleryView } from '../../types/ui';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { LeaderboardAnalysisContext } from "../../providers/LeaderboardProvider";
import { SceneContext } from "../../providers/SceneProvider";

import { ViewLeaderboard, EditLeaderboard } from './LeaderboardForm';
import { useLocalization } from '../../contexts/localizationUtils';

interface GalleryDetailProps {
  view: GalleryView;
  setView: (view: GalleryView) => void;
  leaderboards: Leaderboard[];
  images: Record<number, string>; // Mapping of leaderboard ID to image URL
  currentIndex: number; // Index of the first image in the triplet to display
  onScroll: (direction: 'up' | 'down') => void;
}

interface ImagePanelProps {
  leaderboard: Leaderboard | null;
  imageUrl: string | null;
  position: 'left' | 'center' | 'right';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void; // Added for click navigation
}

interface LeaderboardDetailProps {
    leaderboard: Leaderboard | null;
}

export const LeaderboardDetail: React.FC<LeaderboardDetailProps> = ({ leaderboard }) => {
  const program_name = sessionStorage.getItem("program") || "";
  const authUserData = useContext(AuthUserContext);
  const { analysis, fetchAnalysis } = useContext(LeaderboardAnalysisContext);
  const { scenes } = useContext(SceneContext);
  const [ cloud_type, setCloudType ] = useState<string>("mistake");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { t, language } = useLocalization();
  const [scene, setScene] = useState<Scene | null>(null);

  if (!leaderboard){
    console.error("LeaderboardDetail: No leaderboard provided");
    setErrorKey('error.no_leaderboard');
    return null;
  } else {
    useEffect(() => {
      setErrorKey(null);
      fetchAnalysis(leaderboard?.id, program_name, {cloud_type: cloud_type, lang: language}).then(analysis => {
        if (!analysis) {
          const scene_id = leaderboard?.scene.id;
          setScene(scenes.find(scene => scene.id === scene_id) || null);
        }
      }).catch(err => {
        console.error("Failed to fetch leaderboard analysis: ", err);
        setErrorKey('error.fetch_analysis');
      });


    }, []);
  }

  if (!analysis || !scenes) {
    return <div>{t('loading')}...</div>;
  }

  if (authUserData?.currentUser?.user_type === "student") {
    return (
        <div className="w-full h-full p-4 overflow-y-auto">
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} />
        </div>
    );
  } else {
    return (
      <div className="w-full h-full p-4 overflow-y-auto">
        <ViewLeaderboard leaderboard={leaderboard} analysis={analysis} scenes={scenes} />
      </div>
    );
  }

}

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  leaderboard, 
  imageUrl,
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
        className={`w-full md:w-auto aspect-[4/3] bg-neutral-700 rounded-lg shadow-2xl flex items-center justify-center ${transformClasses} ${opacityClass} border-2 border-neutral-600`}
        style={{ transformStyle: 'preserve-3d', zIndex }}
        aria-hidden="true"
      >
        {/* Empty panel placeholder */}
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full aspect-[4/3] bg-neutral-800 rounded-lg shadow-2xl overflow-hidden ${transformClasses} ${opacityClass} border-2 border-neutral-600 cursor-pointer group`}
      style={{ transformStyle: 'preserve-3d', zIndex }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter} 
      onBlur={onMouseLeave}  
      onClick={onClick} // Added onClick handler
      tabIndex={onClick ? 0 : -1} // Make clickable items focusable
      role="button" // Role implies clickability
      aria-label={onClick ? `Navigate to ${position === 'left' ? 'previous' : 'next'} image: ${leaderboard.title}` : leaderboard.title}
      onKeyDown={(e) => { // Allow activation with Enter/Space for accessibility
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <img src={imageUrl} alt={leaderboard?.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105" />
      {(isHovered) && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
          <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center select-none">{leaderboard?.title}</p>
        </div>
      )}
    </div>
  );
};

export const GalleryDetail: React.FC<GalleryDetailProps> = ({ view, setView, leaderboards, images, currentIndex }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  useEffect(() => {
  }, []);

  if (!leaderboards || leaderboards.length === 0) return null;

  const centerImage = leaderboards[(currentIndex + 1) % leaderboards.length] || null;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          ref={galleryRef} 
          className="flex" 
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          role="region"
          aria-label="Leaderboard"
        >
          <ImagePanel
            leaderboard={centerImage}
            imageUrl={images[centerImage?.id]}
            position="center"
            isHovered={hoveredImageId === centerImage?.id}
            onMouseEnter={() => centerImage && setHoveredImageId(centerImage.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={centerImage ? () => setView('browsing') : undefined}
          />
        </div>
        <div
          className='flex col-span-2 col-start-2 full h-full p-4 overflow-y-auto'
        >
          <GalleryTabs view={view} setView={setView} leaderboard={centerImage} images={images} />
          <LeaderboardDetail leaderboard={centerImage} />
        </div>
      </div>
    </div>

  );
};