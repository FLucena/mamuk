import { useState, useEffect, ReactNode } from 'react';
import { LanguageContext, SupportedLanguage } from './LanguageContext';
import { translations } from './translations';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
  storageKey?: string;
}

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
  storageKey = 'mamuk-language',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // Check if we have a saved language preference
    const storedLanguage = localStorage.getItem(storageKey);
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) {
      return storedLanguage;
    }
    
    // Try to detect browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (browserLanguage === 'es') {
      return 'es';
    }
    
    return defaultLanguage;
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, language);
  }, [language, storageKey]);

  // Function to change language
  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if translation is missing
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    
    // Last resort: return the key itself
    return key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
} 