/** @jsxImportSource @emotion/react */
import { useState, useCallback, useEffect, useContext, type Dispatch, type SetStateAction } from 'react';
import { ImageGallery } from './ImageGallery';
import { AddImageModal } from './AddImageModal';
import type { GalleryView } from '../../types/ui';
import { css } from "@emotion/react";
import {theme} from "../../src/Theme";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LeaderboardListContext } from '../../providers/LeaderboardProvider';
import type { Leaderboard } from '../../types/leaderboard';
import { AuthUserContext } from '../../providers/AuthUserProvider';
import { useLocalization } from '../../contexts/localizationUtils';
import { ErrorDisplay } from '../Common/ErrorDisplay';
import { StoryProvider } from '../../providers/StoryProvider';
import { SceneProvider } from '../../providers/SceneProvider';
import { Checkbox, FormControlLabel } from '@mui/material';

interface GalleryBrowsingProps {
  view: GalleryView;
  setView: (view: GalleryView) => void;
  loadedLeaderboards: Leaderboard[];
  setLoadedLeaderboards: (leaderboards: Leaderboard[]) => void;
  galleryCurrentIndex: number;
  setGalleryCurrentIndex: Dispatch<SetStateAction<number>>;
  setCurLeaderboard: (leaderboard: Leaderboard | null) => void;
  setCurImageUrl: (url: string) => void;
}

export const GalleryBrowsing: React.FC<GalleryBrowsingProps> = ({ view, setView, loadedLeaderboards, setLoadedLeaderboards, galleryCurrentIndex, setGalleryCurrentIndex, setCurLeaderboard, setCurImageUrl }) => {
  const { t } = useLocalization();
  const { currentUser } = useContext(AuthUserContext);
  const { listParams, setListParams, pageParams, setPageParams, fetchLeaderboards, fetchStats } = useContext(LeaderboardListContext);
  const [ loadedStart, setLoadedStart ] = useState<number>(0);
  const [ loadedEnd, setLoadedEnd ] = useState<number>(0);
  const [ toLoadStart, setToLoadStart ] = useState<number>(0);
  const [ toLoadEnd, setToLoadEnd ] = useState<number>(0);

  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [n_leaderboards, setN_Leaderboards] = useState<number>(0);
  const limitLeaderboardIndex = 3;
  const test=false;

  const initialLoading = ()=>{
    setToLoadStart(0);
    setToLoadEnd(limitLeaderboardIndex);
    setLoadedStart(0);
    setLoadedEnd(0);
    setGalleryCurrentIndex(1);
    setLoadedLeaderboards([]);
    setPageParams({ ...(pageParams ?? {}), skip: 0, limit: limitLeaderboardIndex });
    return;
  }

  const handleGalleryScroll = useCallback((direction: 'up' | 'down') => {
      setGalleryCurrentIndex(prevIndex => {
        const length = n_leaderboards;
        if (length === 0) return prevIndex;
        let newIndex = prevIndex;
        if (direction === 'down') { // Scroll down -> move images left (next)
          newIndex = prevIndex + 1;
        } else { // Scroll up -> move images right (previous)
          newIndex = prevIndex - 1;
        }
        
        if (newIndex < 0) {
          return (length + newIndex) % length;
        } else {
          return newIndex % length;
        }
      });
  
      setToLoadEnd(prevEnd => {
        if (direction === 'down' && n_leaderboards > 0 && prevEnd < n_leaderboards) {
          return prevEnd + 1;
        }
        return prevEnd;
      })
      
      setToLoadStart(prevStart => {
        if (direction === 'up' && n_leaderboards > 0) {
          return (prevStart - 1 + n_leaderboards) % n_leaderboards;
        }
        return prevStart;
      });
  
    }, [n_leaderboards]);

  useEffect(() => {
    if (n_leaderboards === 0) return;
    if (loadedLeaderboards.length < n_leaderboards) {
      let skipNumber;
      let limitNumber = 1;
      if (loadedEnd < toLoadEnd) {
        skipNumber = toLoadEnd - 1;
      } else if (loadedStart !== toLoadStart) {
        skipNumber = toLoadStart;
      } else {
        skipNumber = 0;
        limitNumber = 3;
      }
      
      setPageParams({ ...(pageParams ?? {}), skip: skipNumber, limit: limitNumber });
    }

  }, [toLoadStart, toLoadEnd]);
  
  useEffect(() => {
    if (typeof setListParams !== "function") return; // guard if context not ready
    if (typeof setPageParams !== "function") return; // guard if context not ready
    if (!currentUser) return;

    const published_at_start = dayjs().startOf('day').subtract(9, 'day');
    const published_at_end = dayjs().startOf('day');

    setListParams({
      ...(listParams ?? {}),
      published_at_start: listParams?.published_at_start ?? published_at_start,
      published_at_end: listParams?.published_at_end ?? published_at_end,
      is_public: true,
    });

    initialLoading();

  }, [currentUser]);
  
  useEffect(() => {
    setErrorKey(null);
    if (currentUser) {
      fetchStats(currentUser?.is_admin || false).then(statsData => {
        if (statsData) {
          setGalleryCurrentIndex(1);
          setN_Leaderboards(statsData.n_leaderboards || 0);
          setToLoadStart(pageParams?.skip || 0);
          setToLoadEnd(limitLeaderboardIndex);
          fetchLeaderboards(currentUser?.is_admin || false).then(leaderboard => {
            setLoadedLeaderboards([...leaderboard]);
            setLoadedStart(toLoadStart);
            setLoadedEnd(leaderboard.length);
          }).catch(err => {
            setErrorKey('error.fetch_leaderboards');
            console.error("Failed to fetch leaderboards: ", err);
          });
        }
      }).catch(err => {
        setErrorKey('error.fetch_leaderboard_stats');
        console.error("Failed to fetch leaderboard stats: ", err);
      });
    }
  }, [listParams]);
  
  useEffect(() => {
    setErrorKey(null);
    if (currentUser) {
      fetchLeaderboards(currentUser?.is_admin || false).then(leaderboard => {
        if (toLoadEnd !== loadedEnd) {
          setLoadedLeaderboards([...loadedLeaderboards, ...leaderboard]);
          setLoadedEnd(prev => prev + leaderboard.length);
        } else if (toLoadStart !== loadedStart) {
          setLoadedLeaderboards([...leaderboard, ...loadedLeaderboards]);
          setGalleryCurrentIndex(prev => prev + leaderboard.length);
          setLoadedStart(prev=> (prev - 1 + n_leaderboards) % n_leaderboards);
        }
      }).catch(err => {
        setErrorKey('error.fetch_leaderboards');
        console.error("Failed to fetch leaderboards: ", err);
      });
    }
  }, [pageParams]);

  const renderGallery = () => {
        return (
        <div className='h-full w-full bg-neutral-900 items-center justify-center'>
          {
            test && 
              <div className='bg-white'>
                {`Gallery Current Index: ${galleryCurrentIndex} / ${n_leaderboards} | Loaded: ${loadedStart} - ${loadedEnd} | To Load: ${toLoadStart} - ${toLoadEnd} | Loaded Count: ${loadedLeaderboards.length}`}
              </div>
          }
          <div className="h-2/3 relative flex flex-col overflow-hidden pt-4 md:pt-8">
            {(currentUser?.user_type === 'teacher' || currentUser?.is_admin) && (
              <StoryProvider>
              <SceneProvider>
                <AddImageModal />
              </SceneProvider>
            </StoryProvider>
          )}
            
            {n_leaderboards > 0 ? (
              <ImageGallery
                view={view}
                setView={(newView: GalleryView) => {
                  setView(newView)
                  initialLoading();
                }}
                leaderboards={loadedLeaderboards}
                currentIndex={galleryCurrentIndex}
                n_leaderboards={n_leaderboards}
                setCurrentLeaderboard={setCurLeaderboard}
                setCurrentImageUrl={setCurImageUrl}
                onScroll={handleGalleryScroll}
              />
            ) : (
              <p className="text-xl text-gray-400 text-center">{t('galleryView.noImageToDisplay')}</p>
            )}
          </div>
          <div css={controlPanelStyle}>
            <div className='w-full h-full flex justify-center items-center space-x-4'>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('galleryView.publishedAtStartDate')}
                  value={listParams.published_at_start ?? null}
                  views={['year', 'month', 'day']}
                  onChange={(date) => {
                   setListParams({ ...(listParams ?? {}), published_at_start: date ?? undefined });
                   initialLoading();

                 }}
                />
                <DatePicker
                  label={t('galleryView.publishedAtEndDate')}
                  value={listParams.published_at_end ?? null}
                  views={['year', 'month', 'day']}
                  onChange={(date) => {
                   setListParams({ ...(listParams ?? {}), published_at_end: date ?? undefined });
                   initialLoading();
                 }}
                />
              </LocalizationProvider>
              <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={listParams.is_public}
                      color="default"
                      onChange={(_e) => {
                        initialLoading();
                        setListParams({ ...(listParams ?? {}), is_public: !listParams.is_public });
                      }}
                    />
                  }
                  label={t('galleryView.is_public')}
                />
              </div>
            </div>
          </div>
        </div>
        )
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
