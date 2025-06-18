
import React from 'react';
import { GrammarMistakeItem } from '../types';

interface GrammarVisualizationProps {
  mistakes: GrammarMistakeItem[];
  onInteractionEnd: () => void; // Called on mouse up
}

export const GrammarVisualization: React.FC<GrammarVisualizationProps> = ({ mistakes, onInteractionEnd }) => {
  // The "draw the circle if they click down" is interpreted as:
  // clicking down in this area, then clicking up, triggers onInteractionEnd.
  // The circles themselves are static based on props.

  const handleMouseUp = () => {
    onInteractionEnd();
  };

  return (
    <div 
      className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12 p-4 cursor-pointer"
      onMouseUp={handleMouseUp} // Listen for mouse up on the entire container
      title="Click to see descriptive writing" // Tooltip to guide user
    >
      {mistakes.map((mistake) => (
        <div
          key={mistake.id}
          className={`rounded-full flex items-center justify-center p-4 shadow-lg transform transition-all duration-300 hover:scale-105 ${mistake.color} ${mistake.widthClass} ${mistake.heightClass}`}
        >
          <p className={`text-sm sm:text-base md:text-lg font-medium text-center select-none ${mistake.textColor}`}>
            {mistake.label}
          </p>
        </div>
      ))}
       {mistakes.length === 0 && (
        <p className="text-gray-400 text-lg">No grammar data to display.</p>
      )}
    </div>
  );
};
