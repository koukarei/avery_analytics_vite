import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '../types/ui';
import { DEFAULT_LANGUAGE } from '../constants';
import type { Translations } from './localizationUtils';
import {LocalizationContext} from './localizationUtils';

// Removed direct JSON imports with assertions

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('appLanguage') as Language | null;
    // Check if storedLang is a valid key in our intended supported languages
    const isValidStoredLang = storedLang === 'en' || storedLang === 'ja';
    return isValidStoredLang ? storedLang : DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState<Translations>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Tracks if initial translations are loaded

  useEffect(() => {
    const loadTranslations = async (lang: Language) => {
      setIsInitialized(false); // Set to false while loading new language
      try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load ${lang}.json: ${response.statusText}`);
        }
        const data: Translations = await response.json();
        setTranslations(data);
        localStorage.setItem('appLanguage', lang);
        document.documentElement.lang = lang;
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback to default language translations if current one fails
        // Or handle more gracefully, e.g., set to empty or load English as default
        if (lang !== DEFAULT_LANGUAGE) {
          // Attempt to load default language if the selected one failed
          // This prevents getting stuck with no translations
          const defaultResponse = await fetch(`locales/${DEFAULT_LANGUAGE}.json`);
          if (defaultResponse.ok) {
            const defaultData = await defaultResponse.json();
            setTranslations(defaultData);
            localStorage.setItem('appLanguage', DEFAULT_LANGUAGE);
            document.documentElement.lang = DEFAULT_LANGUAGE;
            setLanguageState(DEFAULT_LANGUAGE); // Explicitly reset language state
          } else {
            setTranslations({}); // Clear translations if default also fails
          }
        } else {
           setTranslations({}); // Clear translations if default language fails
        }
      } finally {
        setIsInitialized(true);
      }
    };

    loadTranslations(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    // Basic check if language is one of the supported ones (en, ja)
    if (lang === 'en' || lang === 'ja') {
      setLanguageState(lang);
    } else {
      console.warn(`Language "${lang}" is not supported. Falling back to default.`);
      setLanguageState(DEFAULT_LANGUAGE); // This will trigger the useEffect
    }
  };
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!isInitialized || !translations[key]) {
      // If translations not loaded or key missing, return the key itself
      // Optionally, prefix missing keys: e.g., `[${key}]` for easier debugging
      // For now, just returning the key is fine.
      let processedKey = key;
      if (params) {
        Object.keys(params).forEach(paramKey => {
          processedKey = processedKey.replace(`{${paramKey}}`, String(params[paramKey]));
        });
      }
      return processedKey;
    }
    
    let translation = translations[key];
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, translations, isInitialized }}>
      {children}
    </LocalizationContext.Provider>
  );
};


