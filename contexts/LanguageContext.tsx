
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Language, LocalizedText } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';
import { translations as appTranslations } from '../utils/localization';

interface LanguageContextType {
  translate: (key: string, fallback?: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const language = DEFAULT_LANGUAGE;
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key: string, fallback?: string): string => {
    const langTranslations: LocalizedText | undefined = appTranslations[language];
    if (langTranslations && typeof langTranslations[key] === 'string') {
      return langTranslations[key];
    }
    return fallback || key; 
  };


  return (
    <LanguageContext.Provider value={{ translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
