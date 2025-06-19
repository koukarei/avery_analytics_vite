import React from 'react';
import { useLocalization } from '../contexts/localizationUtils';
import IconComponent from './icons/AVERYIcon';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types/ui';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <IconComponent className="w-16 h-16 items-center text-white mr-2"/>
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
