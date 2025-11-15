/** @jsxImportSource @emotion/react */
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { ImageGallery } from './ImageGallery';
import type { GalleryView } from '../../types/ui';
import type { Leaderboard } from '../../types/leaderboard';
import { WritingPage } from './WritingPage';
import { WriterBrowsing } from './WriterBrowsing';
import { css } from "@emotion/react";
import {theme} from "../../src/Theme";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LeaderboardListContext, LeaderboardImagesContext, LeaderboardStartNewProvider } from '../../providers/LeaderboardProvider';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { useLocalization } from '../../contexts/localizationUtils';
import { GenerationDetailProvider, GenerationEvaluationProvider, GenerationImageProvider } from '../../providers/GenerationProvider';
import { WsProvider } from '../../providers/WsProvider';

import { LoadingSpinner } from '../Common/LoadingSpinner';

const ErrorDisplay: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md" role="alert">
      <p className="text-red-600 font-semibold">{t('error.title')}</p>
      <p className="text-red-500">{t(messageKey)}</p>
    </div>
  );
};

export default function Writer() {
  const [view, setView] = useState<GalleryView>('browsing');
  const { t } = useLocalization();
  const [ curLeaderboard, setCurLeaderboard ] = useState<Leaderboard | null>(null);
  const { currentUser } = useContext(AuthUserContext);
  const { leaderboards, loading, fetchLeaderboards, params, setParams } = useContext(LeaderboardListContext);
  const { images, loading: imagesLoading, fetchImages } = useContext(LeaderboardImagesContext);
  const [errorKey, setErrorKey] = useState<string | null>(null);
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
    if (errorKey) {
      return <ErrorDisplay messageKey={errorKey} />;
    }

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
