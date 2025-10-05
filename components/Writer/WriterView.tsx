/** @jsxImportSource @emotion/react */
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { ImageGallery } from './ImageGallery';
import type { GalleryView } from '../../types/ui';
import { WritingPage } from './WritingPage';
import { css } from "@emotion/react";
import {theme} from "../../src/Theme";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LeaderboardListContext, LeaderboardImagesContext } from '../../providers/LeaderboardProvider';
import { AuthUserContext } from '../../providers/AuthUserProvider';
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

export default function Writer({showStudentNames}: {showStudentNames: boolean}) {
  const [view, setView] = useState<GalleryView>('browsing');
  const { t } = useLocalization();
  const { currentUser } = useContext(AuthUserContext);
  const { leaderboards, loading, fetchLeaderboards } = useContext(LeaderboardListContext);
  const { images, loading: imagesLoading, fetchImages } = useContext(LeaderboardImagesContext);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState<number>(1);
  const [startLeaderboardIndex, setStartLeaderboardIndex] = useState<number>(0);
  const [published_at_start, setPublishedAtStart] = useState<dayjs.Dayjs>(dayjs().startOf('day').subtract(9, 'day'));
  const [published_at_end, setPublishedAtEnd] = useState<dayjs.Dayjs>(dayjs().startOf('day'));
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const limitLeaderboardIndex = 10;

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
  }, [leaderboards]);

  const handleViewChange = (newView: GalleryView) => {
    setView(newView);
  };
  
  useEffect(() => {
    setErrorKey(null);
    if (currentUser) {
      fetchLeaderboards({ skip: startLeaderboardIndex, limit: limitLeaderboardIndex, published_at_start: published_at_start, published_at_end: published_at_end }, currentUser?.is_admin || false ).then(leaderboard => {
        if (leaderboard.length > 0) {
          fetchImages(leaderboard.map(lb => lb.id));
        }
      }).catch(err => {
        setErrorKey('error.fetch_leaderboards');
        console.error("Failed to fetch leaderboards: ", err);
      });
    }
  }, [startLeaderboardIndex, limitLeaderboardIndex, published_at_start, published_at_end, currentUser]);

  useEffect(() => {
    setCurrentImageUrl(images[leaderboards[(galleryCurrentIndex + 1) % leaderboards.length]?.id] || "");
  }, [galleryCurrentIndex]);

  const renderGallery = () => {
    switch (view) {
      case 'browsing':
        return (
        <div className='h-full w-full bg-neutral-900 items-center justify-center'>
          <div className="h-2/3 relative flex flex-col overflow-hidden pt-4 md:pt-8">
            {leaderboards ? (
              <ImageGallery
                view={view}
                setView={handleViewChange}
                leaderboards={leaderboards}
                images={images}
                currentIndex={galleryCurrentIndex}
                onScroll={handleGalleryScroll}
                setPublishedAt_start={setPublishedAtStart}
                setPublishedAt_end={setPublishedAtEnd}
              />
            ) : (
              <p className="text-xl text-gray-400">{t('galleryView.noImageToDisplay')}</p>
            )}
          </div>
          <div css={controlPanelStyle}>
            <div className='w-full h-full flex justify-center items-center space-x-4'>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('galleryView.publishedAtStartDate')}
                  value={published_at_start}
                  views={['year', 'month', 'day']}
                  onChange={(date) => {
                    if (date) {
                      setPublishedAtStart(date);
                      setStartLeaderboardIndex(0);
                      fetchLeaderboards({ skip: startLeaderboardIndex, limit: limitLeaderboardIndex, published_at_start: date, published_at_end: published_at_end }, currentUser?.is_admin || false).then(leaderboard => {
                        if (leaderboard.length > 0) {
                          fetchImages(leaderboard.map(lb => lb.id));
                        }
                      }).catch(err => {
                        console.error("Failed to fetch leaderboards: ", err);
                        setErrorKey('error.fetch_leaderboards');
                      });
                    }
                  }}
                />
                <DatePicker
                  label={t('galleryView.publishedAtEndDate')}
                  value={published_at_end}
                  views={['year', 'month', 'day']}
                  onChange={(date) => {
                    if (date) {
                      setPublishedAtEnd(date);
                      setStartLeaderboardIndex(0);
                      fetchLeaderboards({ skip: startLeaderboardIndex, limit: limitLeaderboardIndex, published_at_start: published_at_start, published_at_end: date }, currentUser?.is_admin || false).then(leaderboard => {
                        if (leaderboard.length > 0) {
                          fetchImages(leaderboard.map(lb => lb.id));
                        }
                      }).catch(err => {
                        console.error("Failed to fetch leaderboards: ", err);
                        setErrorKey('error.fetch_leaderboards');
                      });
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
        )
      case 'detail':
        return (
        <div className="h-full w-full bg-neutral-900 pt-4 md:pt-8">
          {leaderboards ? (
            <WritingPage
              view={view}
              setView={handleViewChange}
              leaderboard={leaderboards[(galleryCurrentIndex + 1) % leaderboards.length] || null}
              imageUrl={currentImageUrl}
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

const controlPanelStyle = css`
  display: flex;
  margin: auto;
  justify-content: center;
  align-items: center;
  padding: 15px;
  width: 600px;
  max-width: 50%;
  color: ${theme.palette.text.primary};
  background-color: ${theme.palette.background.paper};
  border-radius: 8px;
  opacity: 0.85;
`;
