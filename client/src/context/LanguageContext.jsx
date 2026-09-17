import { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGES, translations } from '../i18n/translations.js';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'phone_shop_lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = current.dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, current.dir]);

  function t(key) {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir: current.dir, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
