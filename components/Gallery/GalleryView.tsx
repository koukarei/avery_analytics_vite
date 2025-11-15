import { useState, useContext } from 'react';
import { GalleryTabs } from './GalleryTab';
import { GalleryBrowsing } from './GalleryBrowsing';
import type { GalleryView } from '../../types/ui';
import type { Leaderboard } from '../../types/leaderboard';
import { useLocalization } from '../../contexts/localizationUtils';
import { CustomSettingContext } from '../../providers/CustomSettingProvider';

export default function GalleryView() {
  const [view, setView] = useState<GalleryView>('browsing');
  const { t } = useLocalization();
  const [ galleryCurrentIndex, setGalleryCurrentIndex ] = useState<number>(1);
  const [ loadedLeaderboards, setLoadedLeaderboards ] = useState<Leaderboard[]>([]);
  const [ curLeaderboard, setCurLeaderboard ] = useState<Leaderboard | null>(null);
  const [ curImageUrl, setCurImageUrl ] = useState<string>('');
  const { showStudentNames } = useContext(CustomSettingContext);


  const handleViewChange = (newView: GalleryView) => {
    setView(newView);
  };

  const renderGallery = () => {
    switch (view) {
      case 'browsing':
        return (
          <GalleryBrowsing
            view={view}
            setView={handleViewChange}
            loadedLeaderboards={loadedLeaderboards}
            setLoadedLeaderboards={setLoadedLeaderboards}
            galleryCurrentIndex={galleryCurrentIndex}
            setGalleryCurrentIndex={setGalleryCurrentIndex}
            setCurLeaderboard={setCurLeaderboard}
            setCurImageUrl={setCurImageUrl}
          />
        )
      case 'detail':
        return (
        <div className="h-full w-full pt-4 md:pt-8">
          {curLeaderboard ? (
            <GalleryTabs
              setView={handleViewChange}
              imageUrl={curImageUrl}
              leaderboard={curLeaderboard || null}
              showStudentNames={showStudentNames}
            />
          ) : (
            <p className="text-xl text-gray-400 text-center">{t('galleryView.noImageToDisplay')}</p>
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