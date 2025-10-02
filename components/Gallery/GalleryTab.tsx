/** @jsxImportSource @emotion/react */

import React, { useState, useRef } from 'react';
import { css } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import type { Leaderboard, Scene } from '../../types/leaderboard';
import type { GalleryView, GalleryDetailView } from '../../types/ui';
import { GALLERY_DETAIL_VIEWS } from '../../types/ui';
import { LeaderboardDetail } from './GalleryDetail';
import { LeaderboardItemProvider, LeaderboardSchoolProvider } from '../../providers/LeaderboardProvider';
import { LeaderboardSettings } from './LeaderboardSettings';

import StudentWorkTable from './StudentWorkTable';

import {
  SceneProvider
} from '../../providers/SceneProvider';
import {
  StoryProvider
} from '../../providers/StoryProvider';

import { useLocalization } from '../../contexts/localizationUtils';

interface GalleryTabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function GalleryTabPanel(props: GalleryTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="gallerytabpanel"
      hidden={value !== index}
      id={`full-width-gallerytabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Box>{children}</Box>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-gallerytabpanel-${index}`,
  };
}

interface GalleryTabProps {
  view: GalleryView;
  setView: (view: GalleryView) => void;
  images: Record<number, string>; // Mapping of leaderboard ID to image URL
  leaderboard: Leaderboard | null;
}

export const GalleryTabs: React.FC<GalleryTabProps> = ({ setView, images, leaderboard }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);
  const [detailView, setDetailView] = useState<GalleryDetailView>('detail');
  const [value, setValue] = useState<number>(GALLERY_DETAIL_VIEWS.indexOf(detailView));
  const { t } = useLocalization();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setDetailView(GALLERY_DETAIL_VIEWS[newValue]);
    setValue(newValue);
  };

  return (
    <Grid container spacing={0} className="w-full h-full flex justify-center">
        <Grid
          size={{ xs: 6, md: 3 }} 
          ref={galleryRef} 
          role="region"
          aria-label="Leaderboard"
        >
          {leaderboard ? (
            <ImagePanel
            leaderboard_title={leaderboard.title}
            imageUrl={images[leaderboard?.id]}
            isHovered={hoveredImageId === leaderboard?.id}
            onMouseEnter={() => leaderboard && setHoveredImageId(leaderboard.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={leaderboard ? () => setView('browsing') : undefined}
          />) : (
            <p className="text-xl text-gray-400">{t('galleryView.noImageToDisplay')}</p>
          )
          }
        </Grid>
        <Grid 
          size={{ xs: 12, md: "grow" }} 
          className="h-full shrink overflow-y-scroll"
        >
          <Box css={tabContainerStyle(theme)}>
            <AppBar position="static">
              <Tabs
                css={tabBarStyle(theme)}
                value={value}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs"
              >
                  {GALLERY_DETAIL_VIEWS.map((viewOption, index) => (
                    <Tab
                      key={viewOption}
                      label={t(`galleryView.Tab.${viewOption}`)}
                      {...a11yProps(index)}
                    />
                  ))}
              </Tabs>
            </AppBar>
            <GalleryTabPanel value={value} index={0} dir={theme.direction}>
              
              {leaderboard ? (
                <SceneProvider>
                  <StoryProvider>
                    <LeaderboardItemProvider>
                      <LeaderboardDetail leaderboard_id={leaderboard.id} />
                    </LeaderboardItemProvider>
                  </StoryProvider>
                </SceneProvider>
              ) : (
                <p className="text-xl text-gray-400">{t('galleryView.noLeaderboardToDisplay')}</p>
              )}
            </GalleryTabPanel>
            <GalleryTabPanel value={value} index={1} dir={theme.direction}>
              <StudentWorkTable />
            </GalleryTabPanel>
            <GalleryTabPanel value={value} index={2} dir={theme.direction}>
              <LeaderboardSchoolProvider>
                <LeaderboardSettings leaderboard_id={leaderboard ? leaderboard.id : 0} />
              </LeaderboardSchoolProvider>
            </GalleryTabPanel>
          </Box>
        </Grid>
    </Grid>
  );
};

interface ImagePanelProps {
  leaderboard_title: string;
  imageUrl: string | null;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void; // Added for click navigation
}

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  leaderboard_title, 
  imageUrl,
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  onClick 
}) => {
  const transformClasses = 'transition-all duration-700 ease-in-out transform-gpu scale-100 translate-z-[20px]'; 
  const zIndex = 20;
  const opacityClass = 'opacity-100';
  
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
      onKeyDown={(e) => { // Allow activation with Enter/Space for accessibility
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {imageUrl ? <img src={imageUrl} alt={leaderboard_title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105" /> : null}
      {(isHovered) && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
          <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center select-none">{leaderboard_title}</p>
        </div>
      )}
    </div>
  );
};

const tabBarStyle = (theme: Theme) => css`
  background-color: ${theme.palette.primary.light};
  border-color: ${theme.palette.primary.dark};
`;

const tabContainerStyle = (theme: Theme) => css`
  background-color: ${theme.palette.background.paper};
  width: 100%;
  height: 100%;
  border-radius: 8px;
`;