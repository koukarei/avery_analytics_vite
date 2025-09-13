/** @jsxImportSource @emotion/react */

import React, { useState, useRef, useContext, useEffect } from 'react';
import { css, keyframes } from "@emotion/react";
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import type { Leaderboard, LeaderboardAnalysis, Scene } from '../../types/leaderboard';
import type { GalleryView, GalleryDetailView } from '../../types/ui';
import { GALLERY_DETAIL_VIEWS } from '../../types/ui';
import { LeaderboardDetail } from './GalleryDetail';

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
  detailView: GalleryDetailView;
  setDetailView: (view: GalleryDetailView) => void;
  images: Record<number, string>; // Mapping of leaderboard ID to image URL
  leaderboard: Leaderboard | null;
}

export const GalleryTabs: React.FC<GalleryTabProps> = ({ view, setView, images, leaderboard }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<GalleryDetailView>('detail');
  const value = GALLERY_DETAIL_VIEWS.indexOf(detailView);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setDetailView(GALLERY_DETAIL_VIEWS[newValue]);
  };

  return (
    <div>
        <div 
          ref={galleryRef} 
          className="flex" 
          role="region"
          aria-label="Leaderboard"
        >
          <ImagePanel
            leaderboard={leaderboard}
            imageUrl={images[leaderboard?.id]}
            position="center"
            isHovered={hoveredImageId === leaderboard?.id}
            onMouseEnter={() => leaderboard && setHoveredImageId(leaderboard.id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={leaderboard ? () => setView('browsing') : undefined}
          />
        </div>
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
          <Tab label="Detail" {...a11yProps(0)} />
          <Tab label="Word Cloud" {...a11yProps(1)} />
          <Tab label="Leaderboard" {...a11yProps(2)} />
          <Tab label="Writer" {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <GalleryTabPanel value={value} index={0} dir={theme.direction}>
        <LeaderboardDetail leaderboard={leaderboard} />
      </GalleryTabPanel>
      <GalleryTabPanel value={value} index={1} dir={theme.direction}>
        Word Cloud
      </GalleryTabPanel>
      <GalleryTabPanel value={value} index={2} dir={theme.direction}>
        Leaderboard
      </GalleryTabPanel>
      <GalleryTabPanel value={value} index={3} dir={theme.direction}>
        Writer
      </GalleryTabPanel>
    </Box>
    </div>
  );
}


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

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  leaderboard, 
  imageUrl,
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  onClick 
}) => {
  let transformClasses = 'transition-all duration-700 ease-in-out transform-gpu'; 
  let zIndex = 10;
  let opacityClass = 'opacity-100';

  transformClasses += ' scale-100 translate-z-[20px]'; // Center panel pops slightly forward
  zIndex = 20;
  
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

export const GalleryDetail: React.FC<GalleryDetailProps> = ({ setView, leaderboards, images, currentIndex }) => {
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
          className='flex col-span-2 col-start-2 full h-full p-4 overflow-y-auto'
        >
          <LeaderboardForm value={0} index={0} dir={'ltr'}></LeaderboardForm>
        </div>
      </div>
    </div>

  );
};

const tabBarStyle = (theme: Theme) => css`
  background-color: ${theme.palette.primary.light};
  border-color: ${theme.palette.primary.dark};
`;

const tabContainerStyle = (theme: Theme) => css`
  background-color: ${theme.palette.background.paper};
`;