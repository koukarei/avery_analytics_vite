import { createContext, useContext } from 'react';

import type { Language } from '../types/ui';

export type Translations = Record<string, string>;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations;
  isInitialized: boolean; // To indicate if initial translations are loaded
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};