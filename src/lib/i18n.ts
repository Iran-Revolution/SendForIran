/**
 * Internationalization utility functions for SendForIran
 */

import en from '../../data/i18n/en.json';
import fa from '../../data/i18n/fa.json';
import de from '../../data/i18n/de.json';
import fr from '../../data/i18n/fr.json';

export type SupportedLang = 'en' | 'fa' | 'de' | 'fr';
export type I18nData = typeof en;

const translations: Record<SupportedLang, I18nData> = {
  en,
  fa,
  de,
  fr,
};

/** Get translations for a specific language */
export function getTranslations(lang: SupportedLang = 'en'): I18nData {
  return translations[lang] || translations.en;
}

/** Get a nested translation value by dot notation path */
export function t(lang: SupportedLang, path: string): string {
  const keys = path.split('.');
  let value: unknown = translations[lang] || translations.en;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path;
}

/** Check if language is RTL */
export function isRTL(lang: SupportedLang): boolean {
  return lang === 'fa';
}

/** Get language display names */
export const languageNames: Record<SupportedLang, string> = {
  en: 'EN',
  fa: 'فارسی',
  de: 'DE',
  fr: 'FR',
};

/** Get all supported languages */
export const supportedLanguages: SupportedLang[] = ['en', 'fa', 'de', 'fr'];

/** Build localized path - preserves path when switching languages */
export function getLocalizedPath(targetLang: SupportedLang, currentPath: string): string {
  // Remove current language prefix if exists
  const pathWithoutLang = currentPath.replace(/^\/(en|fa|de|fr)(\/|$)/, '/');
  const cleanPath = pathWithoutLang === '' ? '/' : pathWithoutLang;
  
  // English is the default locale (no prefix)
  if (targetLang === 'en') {
    return cleanPath;
  }
  
  // Add language prefix for non-default locales
  return `/${targetLang}${cleanPath === '/' ? '' : cleanPath}`;
}

/** Extract language from URL path */
export function getLangFromPath(path: string): SupportedLang {
  const match = path.match(/^\/(fa|de|fr)(\/|$)/);
  return (match?.[1] as SupportedLang) || 'en';
}

