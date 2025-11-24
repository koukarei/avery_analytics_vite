/** @jsxImportSource @emotion/react */

import React from 'react';
import { css, keyframes } from "@emotion/react";

interface ImagePanelProps {
  position: 'left' | 'center' | 'right';
  color?: string;
  width?: string;
  height?: string;
}

export const LoadingImagePanel: React.FC<ImagePanelProps> = ({ 
  position,
  color = '',
  width,
  height
}) => {

  let transformClasses = 'transition-all duration-700 ease-in-out transform-gpu'; 
  let opacityClass = 'opacity-100';
  
  // Adjusted 3D transforms to match the example image more closely
  switch (position) {
    case 'left':
      transformClasses += ' rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
    case 'center':
      transformClasses += ' scale-100 translate-z-[20px]'; // Center panel pops slightly forward
      break;
    case 'right':
      transformClasses += ' -rotate-y-[50deg] scale-[0.8] -translate-z-[100px]';
      opacityClass = 'opacity-75 group-hover:opacity-90 group-focus:opacity-90';
      break;
  }
  
    return (
      <div 
        className={`w-2/3 sm:w-1/2 md:w-1/3 aspect-[4/3] ${color} rounded-lg shadow-2xl flex items-center justify-center ${transformClasses} ${opacityClass} border-2 border-neutral-600`}
        css={LoadingImageStyles(height, width)}
        aria-hidden="true"
      >
        {/* Empty panel placeholder */}
      </div>
    );
}

const loaderKeyFrame = keyframes`
  0% {
    opacity: 0.3;
    box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.2);
  }
  100%   {
    opacity: 0.5;
    box-shadow: 0 0 5px 0px rgba(255, 255, 255, 0.4);
  }
`;

const LoadingImageStyles = (
  height?: string,
  width?: string
) => css`
  ${height ? `height: ${height};` : ''}
  ${width ? `width: ${width};` : ''}
  transform-style: preserve-3d;
  animation: ${loaderKeyFrame} 2s infinite linear;
`;