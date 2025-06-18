import React from 'react';
import { useLocalization } from '../contexts/localizationUtils';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types/ui';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();

  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <AcademicCapIcon className="w-10 h-10 text-white mr-3"/>
          <h1 className="text-3xl font-bold text-white">{t('header.title')}</h1>
        </div>
        <div className="flex space-x-2">
          {Object.keys(SUPPORTED_LANGUAGES).map((langCode) => (
            <button
              key={langCode}
              onClick={() => setLanguage(langCode as Language)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${language === langCode 
                  ? 'bg-white text-primary' 
                  : 'bg-primary-dark text-white hover:bg-primary-light hover:text-primary-dark'
                }`}
              aria-pressed={language === langCode}
            >
              {SUPPORTED_LANGUAGES[langCode as Language].name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
