/** @jsxImportSource @emotion/react */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { blueGrey } from '@mui/material/colors';

import React, { useState, useContext, useEffect, useRef } from 'react';
import { css, keyframes } from "@emotion/react";
import Flashcard from './FlipCard';
import type { Theme } from "@mui/material/styles";
import {theme} from "../../src/Theme";
import dayjs from 'dayjs';
import { Button } from '@mui/material';

interface PastWritingsProps {
  generation_ids: number[];
  onClick: (id: number) => void;
}

interface PastWritingProps {
  generation_id: number | null;
}

const PastWriting: React.FC<PastWritingProps> = ({ 
  generation_id, 
}) => {
  
  if (!generation_id) {
    return (
      <div 
        style={{ transformStyle: 'preserve-3d' }}
        aria-hidden="true"
      >
        {/* Empty panel placeholder */}
      </div>
    );
  }
  
  return (
    <Card
      style={{ transformStyle: 'preserve-3d'}}
      role="button" // Role implies clickability
    >
        <Flashcard css={flashcardStyle(theme)} generation_id={generation_id} view={'Select'} />
    </Card>
  );
};


const PastWritings: React.FC<PastWritingsProps> = ({ generation_ids }) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  if (!generation_ids || generation_ids.length === 0) return null;
  
  return (
    <div>
      <div 
        ref={galleryRef} 
        id='past-writings-gallery'
        className="h-full w-full flex items-start justify-center space-x-[-5%] sm:space-x-[-2%] md:space-x-[-1%] relative" 
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        role="region"
        aria-label="Leaderboard"
      >
        {generation_ids.map((gen_id, index) => {
            return (
                <PastWriting key={index} generation_id={gen_id} />
            )
        })}
      </div>
    </div>
  );
};

const flashcardStyle = (theme: Theme) => css`
  background-color: ${theme.palette.primary.dark};
  color: ${theme.palette.primary.contrastText};
  z-index: 10;
  padding: 0.5rem;
`;

interface PastWritingIconProps {
    key: number;
    index: number;
    onClick: (id: number) => void;
}

const PastWritingIcon: React.FC<PastWritingIconProps> = ({ 
    key, index, onClick 
}) => {
    const paletteKeys = [50, 100, 300, 500, 700, 900];
    const color = blueGrey[paletteKeys[index % paletteKeys.length]];
    
    return (
        <Avatar sx={{ bgcolor: color }}>
            <Button
                onClick={() => onClick(key)}
            >
                {index + 1}
            </Button>
        </Avatar>
    )
}
const PastWritingsBar: React.FC<PastWritingsProps> = ({ generation_ids, onClick }) => {
    return (
        <Box className='flex flex-nowrap justify-start flex-row'>
            <Stack direction="row">
                {generation_ids.map((id, index) => <PastWritingIcon key={id} index={index} onClick={onClick} />)}
            </Stack>
        </Box>
    );
}

export { PastWritingsBar };