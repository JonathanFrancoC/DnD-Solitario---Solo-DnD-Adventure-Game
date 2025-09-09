import React, { createContext, useContext, useState, useEffect } from 'react';

// Importar archivos de traducción
import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';
import { getTranslatedSpells } from '../utils/translationService';

const LanguageContext = createContext();

// Función para obtener traducciones / Function to get translations
const getTranslations = (language) => {
  const baseTranslations = language === 'en' ? enTranslations : esTranslations;
  const spellTranslations = getTranslatedSpells(language);
  
  return {
    ...baseTranslations,
    spells: spellTranslations.spells
  };
};

// Hook personalizado para usar el contexto de idioma / Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Función para obtener texto traducido / Function to get translated text
export const useTranslation = () => {
  const { language, translations } = useLanguage();
  
  const t = (key, fallback = '') => {
    // Dividir la clave por puntos para navegar el objeto / Split key by dots to navigate object
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Si no se encuentra la traducción, usar fallback o la clave / If translation not found, use fallback or key
        console.log(` Traducción no encontrada: ${key} (idioma: ${language})`);
        return fallback || key;
      }
    }
    
    return value || fallback || key;
  };
  
  return { t, language };
};

// Proveedor del contexto de idioma / Language context provider
export const LanguageProvider = ({ children }) => {
  // Obtener idioma guardado o usar español por defecto / Get saved language or use Spanish as default
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('dnd-solitario-language');
    return savedLanguage || 'es';
  });
  
  // Obtener traducciones para el idioma actual / Get translations for current language
  const [translations, setTranslations] = useState(() => getTranslations(language));
  
  // Cambiar idioma / Change language
  const changeLanguage = (newLanguage) => {
    if (newLanguage !== language) {
      console.log(`🔄 Cambiando idioma de ${language} a ${newLanguage}`);
      setLanguage(newLanguage);
      setTranslations(getTranslations(newLanguage));
      localStorage.setItem('dnd-solitario-language', newLanguage);
      
      // Actualizar el atributo lang del HTML / Update HTML lang attribute
      document.documentElement.lang = newLanguage;
      
      console.log(`Idioma cambiado a: ${newLanguage}`); // Language changed to: ${newLanguage}
    }
  };
  
  // Efecto para actualizar traducciones cuando cambia el idioma / Effect to update translations when language changes
  useEffect(() => {
    setTranslations(getTranslations(language));
    document.documentElement.lang = language;
  }, [language]);
  
  // Efecto para cargar idioma guardado al inicio / Effect to load saved language on startup
  useEffect(() => {
    const savedLanguage = localStorage.getItem('dnd-solitario-language');
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  const value = {
    language,
    translations,
    changeLanguage,
    // Funciones de utilidad / Utility functions
    isSpanish: language === 'es',
    isEnglish: language === 'en',
    // Función para obtener idioma completo / Function to get full language name
    getLanguageName: () => language === 'es' ? 'Español' : 'English'
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
