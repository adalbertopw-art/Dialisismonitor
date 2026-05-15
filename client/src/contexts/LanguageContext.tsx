import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

const dictionaries = {
  es: {
    "dashboard.title": "Monitor de Unidad — Hemodiálisis",
    "sidebar.theme_light": "Tema Claro",
    "sidebar.theme_dark": "Tema Oscuro",
    "sidebar.language_en": "English",
    "sidebar.language_es": "Español",
  },
  en: {
    "dashboard.title": "HD Unit Monitor — Hemodialysis",
    "sidebar.theme_light": "Light Theme",
    "sidebar.theme_dark": "Dark Theme",
    "sidebar.language_en": "English",
    "sidebar.language_es": "Español",
  }
};

type Translations = typeof dictionaries.es;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: keyof Translations) => {
    return dictionaries[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
