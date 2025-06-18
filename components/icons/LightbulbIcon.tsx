
import React from 'react';

interface LightbulbIconProps {
  className?: string;
}

const LightbulbIcon: React.FC<LightbulbIconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a3.375 3.375 0 0 1-3 0M12 6.75A2.25 2.25 0 0 1 14.25 9v1.009c0 .094.022.186.062.271a4.504 4.504 0 0 1 2.138 4.068 4.5 4.5 0 0 1-8.998 0 4.504 4.504 0 0 1 2.138-4.068 1.12 1.12 0 0 0 .062-.271V9A2.25 2.25 0 0 1 12 6.75Zm0 0H12M12 6.75a2.25 2.25 0 0 0-2.25 2.25v1.009c0 .094-.022.186-.062.271a4.504 4.504 0 0 0-2.138 4.068 4.5 4.5 0 0 0 8.998 0 4.504 4.504 0 0 0-2.138-4.068 1.12 1.12 0 0 1-.062-.271V9A2.25 2.25 0 0 0 12 6.75Z" />
  </svg>
);

export default LightbulbIcon;
    