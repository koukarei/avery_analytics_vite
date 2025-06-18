
import React from 'react';

interface DescriptiveWritingProps {
  text: string;
  onReturnToGrammarView: () => void; 
}

export const DescriptiveWriting: React.FC<DescriptiveWritingProps> = ({ text, onReturnToGrammarView }) => {
  return (
    <div 
      className="w-full max-w-2xl h-full bg-neutral-700 p-6 rounded-lg shadow-xl flex flex-col"
      role="article"
      aria-labelledby="descriptive-writing-title"
    >
      <h3 id="descriptive-writing-title" className="text-2xl font-semibold mb-4 text-teal-300 select-none">Descriptive Writing Sample</h3>
      <div className="flex-grow overflow-y-auto p-3 bg-neutral-800 rounded scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 mb-4">
        <p className="text-gray-200 whitespace-pre-line leading-relaxed text-base md:text-lg">
          {text}
        </p>
      </div>
      <button
        onClick={onReturnToGrammarView}
        className="mt-auto bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 self-center"
        aria-label="Return to grammar mistakes visualization"
      >
        Return to Grammar View
      </button>
    </div>
  );
};