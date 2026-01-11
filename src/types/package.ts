/**
 * Email Package type definitions for SendForIran
 *
 * An EmailPackage is a curated bundle containing a template
 * paired with contextually-appropriate recipients.
 *
 * Simplified structure with multi-language display support.
 */

import type { SupportedLang } from '../lib/i18n';
import type { TemplateVariation } from './template';

/**
 * Localized string with translations for all supported UI languages
 */
export type LocalizedString = {
  [key in SupportedLang]?: string;
} & {
  en: string; // English is always required as fallback
};

/**
 * Display information with multi-language support
 */
export interface PackageDisplay {
  title: LocalizedString;
  description: LocalizedString;
}

/**
 * Template content within a package
 */
export interface PackageTemplate {
  subject: string;
  body: string;
  variations?: TemplateVariation[];
}

/**
 * Pre-selected recipients for the package (just IDs)
 */
export interface PackageRecipients {
  /** Array of recipient IDs that this package targets */
  ids: string[];
}

/**
 * Complete Email Package structure (simplified)
 *
 * @example
 * ```json
 * {
 *   "id": "us-media-urgent-001",
 *   "display": {
 *     "title": { "en": "Urgent Media Alert", "fa": "هشدار فوری رسانه‌ای" },
 *     "description": { "en": "Contact major news outlets", "fa": "..." }
 *   },
 *   "template": { "subject": "...", "body": "..." },
 *   "recipients": { "ids": ["nyt-iran-desk", ...] }
 * }
 * ```
 */
export interface EmailPackage {
  /** Unique identifier: "{country}-{type}-{sequence}" */
  id: string;
  /** Display information with multi-language support */
  display: PackageDisplay;
  /** Email template content */
  template: PackageTemplate;
  /** Pre-selected recipient IDs */
  recipients: PackageRecipients;
}

/**
 * Package file wrapper (for nested JSON structure)
 */
export interface PackageFile {
  package: EmailPackage;
}

/**
 * Helper function to get localized value with fallback to English
 */
export function getLocalizedValue(
  localizedString: LocalizedString,
  lang: SupportedLang
): string {
  return localizedString[lang] || localizedString.en;
}
