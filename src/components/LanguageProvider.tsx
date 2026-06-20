'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

export type Language = 'en' | 'hi';

type Translations = typeof en;

const translations: Record<Language, Translations> = { en, hi };

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang === 'en' || storedLang === 'hi') {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Attempt to update user profile API with updated language choice
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }),
    }).catch((e) => console.log('User not logged in or cannot update remote language choice', e));
  };

  const t = (path: string, variables?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let result: any = translations[language];

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to English if key is missing in active language
        let fallbackResult: any = translations['en'];
        for (const fKey of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && fKey in fallbackResult) {
            fallbackResult = fallbackResult[fKey];
          } else {
            return path;
          }
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result !== 'string') {
      return path;
    }

    if (variables) {
      let templated = result;
      for (const [key, value] of Object.entries(variables)) {
        templated = templated.replace(new RegExp(`{${key}}`, 'g'), String(value));
      }
      return templated;
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
