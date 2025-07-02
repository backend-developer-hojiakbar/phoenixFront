
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Language, Translations, LocalizedText } from '../types';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../constants';
import { translations as appTranslations } from '../utils/localization'; // Assuming translations are defined here

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string, fallback?: string) => string;
  translations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('anotLanguage') as Language;
    return SUPPORTED_LANGUAGES.includes(storedLang) ? storedLang : DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLanguage: Language) => {
    if (SUPPORTED_LANGUAGES.includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem('anotLanguage', newLanguage);
    }
  };
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key: string, fallback?: string): string => {
    const langTranslations: LocalizedText | undefined = appTranslations[language];
    if (langTranslations && typeof langTranslations[key] === 'string') {
      return langTranslations[key];
    }
    // If translation is missing for the current language, use explicit fallback or the key itself.
    // No automatic fallback to English.
    return fallback || key; 
  };


  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, translations: appTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};