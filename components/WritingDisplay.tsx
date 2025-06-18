import React from 'react';
import type { WritingEntry } from '../types/studentWork';
import { PLACEHOLDER_IMAGE_DIMENSIONS } from '../constants';
import { useLocalization } from '../contexts/localizationUtils';

interface WritingDisplayProps {
  writing: WritingEntry;
}

const WritingDisplay: React.FC<WritingDisplayProps> = ({ writing }) => {
  const { t, language } = useLocalization();
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
      <h4 className="text-lg font-semibold text-primary mb-1">{writing.title}</h4>
      <p className="text-xs text-slate-500 mb-2">{t('writingDisplay.dateLabel')}: {new Date(writing.date).toLocaleDateString(language)}</p>
      {writing.imageUrl && (
        <img 
          src={writing.imageUrl} 
          alt={writing.title} 
          className="w-full h-auto max-h-60 object-cover rounded-md mb-3 shadow-sm"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/${PLACEHOLDER_IMAGE_DIMENSIONS.medium}?random=${Math.random()}`)}
        />
      )}
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{writing.content}</p>
    </div>
  );
};

export default WritingDisplay;
