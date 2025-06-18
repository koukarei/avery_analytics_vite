import React from 'react';
import type { WritingMistake } from '../types/studentWork';
import { MISTAKE_CATEGORY_KEYS } from '../constants';
import { useLocalization } from '../contexts/localizationUtils';

interface MistakesListProps {
  mistakes: WritingMistake[];
}

const getCategoryColor = (categoryKey: string) => {
  // Color mapping remains based on keys, which are constant
  switch (categoryKey) {
    case MISTAKE_CATEGORY_KEYS.GRAMMAR: return 'bg-red-100 text-red-700';
    case MISTAKE_CATEGORY_KEYS.PUNCTUATION: return 'bg-yellow-100 text-yellow-700';
    case MISTAKE_CATEGORY_KEYS.SPELLING: return 'bg-green-100 text-green-700';
    case MISTAKE_CATEGORY_KEYS.STYLE: return 'bg-blue-100 text-blue-700';
    case MISTAKE_CATEGORY_KEYS.VOCABULARY: return 'bg-purple-100 text-purple-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

const MistakesList: React.FC<MistakesListProps> = ({ mistakes }) => {
  const { t } = useLocalization();

  if (mistakes.length === 0) {
    return <p className="text-slate-500">{t('mistakesList.noMistakes')}</p>;
  }

  return (
    <div className="space-y-4">
      {mistakes.map((mistake, index) => (
        <div key={mistake.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-secondary">
              {index + 1}. {mistake.mistake} {/* Mistake title from mock data, not translated */}
            </h3>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getCategoryColor(mistake.categoryKey)}`}>
              {t(`mistakeCategories.${mistake.categoryKey}`)}
            </span>
          </div>
          <p className="text-slate-600 mb-1">{mistake.description}</p> {/* Mistake description from mock data, not translated */}
          <p className="text-sm text-primary font-medium">{t('mistakesList.frequencyScoreLabel')}: {mistake.frequency}</p>
        </div>
      ))}
    </div>
  );
};

export default MistakesList;
