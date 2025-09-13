import React, { useState, useCallback, useEffect, useContext } from 'react';
import { ImageGallery } from './ImageGallery';
import { GalleryTabs } from './GalleryTab';
import type { GalleryView } from '../../types/ui';
import { LeaderboardListContext, LeaderboardAnalysisContext, LeaderboardImagesContext, WordCloudContext } from '../../providers/LeaderboardProvider';
import type { LeaderboardListContextType, LeaderboardAnalysisContextType } from '../../providers/LeaderboardProvider';
import { useLocalization } from '../../contexts/localizationUtils';

const LoadingSpinner: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-slate-600">{t('loading.text')}</p>
    </div>
  );
};

const ErrorDisplay: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md" role="alert">
      <p className="text-red-600 font-semibold">{t('error.title')}</p>
      <p className="text-red-500">{t(messageKey)}</p>
    </div>
  );
};

export default function GalleryView() {
  const [view, setView] = useState<GalleryView>('browsing');
  const { t } = useLocalization();
  const { leaderboards, loading, fetchLeaderboards } = useContext(LeaderboardListContext);
  const { images, loading: imagesLoading, fetchImages } = useContext(LeaderboardImagesContext);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState<number>(1);
  //const [bottomContent, setBottomContent] = useState<BottomContentType>(BottomContentType.GRAMMAR_VISUALIZATION);

  const handleGalleryScroll = useCallback((direction: 'up' | 'down') => {
    setGalleryCurrentIndex(prevIndex => {
      const length = leaderboards.length;
      let newIndex = prevIndex;
      if (direction === 'down') { // Scroll down -> move images left (next)
        newIndex = prevIndex + 1;
      } else { // Scroll up -> move images right (previous)
        newIndex = prevIndex - 1;
      }
      
      if (newIndex < 0) {
        return length + newIndex;
      } else {
        return newIndex % length;
      }
    });
  }, [leaderboards.length]);

  const handleViewChange = (newView: GalleryView) => {
    setView(newView);
  };
  
  useEffect(() => {
    setErrorKey(null);
    fetchLeaderboards({}).then(leaderboards => {
      if (leaderboards.length > 0) {
        fetchImages(leaderboards.map(lb => lb.id));
      }
    }).catch(err => {
      console.error("Failed to fetch leaderboards: ", err);
      setErrorKey('error.fetch_leaderboards');
    });


  }, []);

  const renderGallery = () => {
    switch (view) {
      case 'browsing':
        return (
        <div className="h-full relative flex flex-col items-center justify-center bg-neutral-900 overflow-hidden pt-4 md:pt-8">
          {leaderboards ? (
            <ImageGallery
              view={view}
              setView={handleViewChange}
              leaderboards={leaderboards}
              images={images}
              currentIndex={galleryCurrentIndex}
              onScroll={handleGalleryScroll}
            />
          ) : (
            <p className="text-xl text-gray-400">{t('galleryView.noImageToDisplay')}</p>
          )}
        </div>
        )
      case 'detail':
        return (
        <div className="h-full w-full overflow-hidden pt-4 md:pt-8">
          {leaderboards ? (
            <GalleryTabs
              setView={handleViewChange}
              leaderboard={leaderboards[(galleryCurrentIndex + 1) % leaderboards.length] || null}
              images={images}
            />
          ) : (
            <p className="text-xl text-gray-400">{t('galleryView.noImageToDisplay')}</p>
          )}
            
        </div>
        )
      default:
        return <p className="text-slate-500 text-center py-10">{t('placeholders.selectView')}</p>;
  }
  };

  const renderContent = () => {
    if (loading || imagesLoading) {
      return <LoadingSpinner />;
    }
    if (errorKey) {
      return <ErrorDisplay messageKey={errorKey} />;
    }

    return (
      <div className="flex flex-col h-screen bg-black overflow-hidden">
        {renderGallery()}
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};