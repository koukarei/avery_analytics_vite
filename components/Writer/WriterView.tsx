/** @jsxImportSource @emotion/react */
import { useState, useContext } from 'react';

import type { GalleryView } from '../../types/ui';
import type { Leaderboard } from '../../types/leaderboard';
import { WritingPage } from './WritingPage';
import { WriterBrowsing } from './WriterBrowsing';
import { LeaderboardListContext, LeaderboardStartNewProvider } from '../../providers/LeaderboardProvider';
import { useLocalization } from '../../contexts/localizationUtils';
import { GenerationDetailProvider, GenerationEvaluationProvider, GenerationImageProvider } from '../../providers/GenerationProvider';
import { WsProvider } from '../../providers/WsProvider';
import { RandomLeaderboardProvider } from '../../providers/randomLeaderboardProvider';

export default function Writer() {
  const [view, setView] = useState<GalleryView>('browsing');
  const { t } = useLocalization();
  const [ curLeaderboard, setCurLeaderboard ] = useState<Leaderboard | null>(null);
  const { leaderboards } = useContext(LeaderboardListContext);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");


  const handleViewChange = (newView: GalleryView) => {
    setView(newView);
  };

  const renderGallery = () => {
    switch (view) {
      case 'browsing':
        return (
          <WriterBrowsing
            view={view}
            setView={handleViewChange}
            setCurLeaderboard={setCurLeaderboard}
            setCurImageUrl={setCurrentImageUrl}
          />
        )
      case 'detail':
        return (
        <div className="h-full w-full bg-neutral-900 pt-4 md:pt-8">
          {leaderboards ? (
            <GenerationDetailProvider>
              <GenerationImageProvider>
                <GenerationEvaluationProvider>
                  <WsProvider>
                    <LeaderboardStartNewProvider>
                      <WritingPage
                        setView={handleViewChange}
                        leaderboard={curLeaderboard}
                        imageUrl={currentImageUrl}
                      />
                    </LeaderboardStartNewProvider>
                  </WsProvider>
                </GenerationEvaluationProvider>
              </GenerationImageProvider>
            </GenerationDetailProvider>
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

    return (
      <div className="flex flex-col h-screen bg-black">
        <RandomLeaderboardProvider>
          {renderGallery()}
        </RandomLeaderboardProvider>
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};
