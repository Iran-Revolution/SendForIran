/**
 * Email Package type definitions for SendForIran
 * 
 * An EmailPackage is a curated bundle containing a template
 * paired with contextually-appropriate recipients.
 */

import type { RecipientCategory } from './recipient';
import type { TemplateType, TemplateVariation, Source } from './template';
import type { SupportedLang } from '../lib/i18n';

/**
 * Localized string supporting multiple languages
 * English is always required, others are optional
 */
export interface LocalizedString {
  en: string;
  fa?: string;
  de?: string;
  fr?: string;
}

/**
 * Localized keywords for search and discovery
 */
export interface LocalizedKeywords {
  en: string[];
  fa?: string[];
  de?: string[];
  fr?: string[];
}

/**
 * Package priority levels (1 = highest priority)
 */
export type PackagePriority = 1 | 2 | 3;

/**
 * Package badge types for visual emphasis
 */
export type PackageBadge = 'NEW' | 'TRENDING' | 'FEATURED' | 'HIGH_IMPACT' | 'URGENT';

/**
 * Package color themes matching Tailwind classes
 */
export type PackageColor = 
  | 'blue'      // Primary
  | 'red'       // Urgent
  | 'green'     // Action
  | 'purple'    // Awareness
  | 'amber'     // Sanctions/Government
  | 'emerald';  // MPs

/**
 * Package metadata for sorting and filtering
 */
export interface PackageMeta {
  type: TemplateType;
  priority: PackagePriority;
  created: string;  // ISO 8601 date
  updated: string;  // ISO 8601 date
}

/**
 * Multi-language display information
 */
export interface PackageDisplay {
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedKeywords;
  icon: string;  // Emoji or icon identifier
}

/**
 * Template content within a package
 */
export interface PackageTemplate {
  subject: string;
  body: string;
  variations: TemplateVariation[];
  sources: Source[];
}

/**
 * Pre-selected recipients for the package
 */
export interface PackageRecipients {
  /** Array of recipient IDs that this package targets */
  ids: string[];
  /** Explanation of why these recipients were selected */
  targetingRationale: LocalizedString;
  /** Categories of recipients included */
  categories: RecipientCategory[];
}

/**
 * UI/display configuration for the package
 */
export interface PackageUI {
  color: PackageColor;
  featured: boolean;
  badge?: PackageBadge;
}

/**
 * Complete Email Package structure
 * 
 * @example
 * ```json
 * {
 *   "id": "us-media-urgent-001",
 *   "version": "1.0",
 *   "meta": { "type": "urgent", "priority": 1, ... },
 *   "display": { "title": { "en": "Urgent Media Alert" }, ... },
 *   "template": { "subject": "...", "body": "...", ... },
 *   "recipients": { "ids": ["nyt-iran-desk", ...], ... },
 *   "ui": { "color": "red", "featured": true, "badge": "URGENT" }
 * }
 * ```
 */
export interface EmailPackage {
  /** Unique identifier: "{country}-{type}-{sequence}" */
  id: string;
  /** Schema version for future migrations */
  version: string;
  /** Metadata for sorting and filtering */
  meta: PackageMeta;
  /** Multi-language display information */
  display: PackageDisplay;
  /** Email template content */
  template: PackageTemplate;
  /** Pre-selected recipient configuration */
  recipients: PackageRecipients;
  /** Visual/UI configuration */
  ui: PackageUI;
}

/**
 * Package file structure as stored in JSON
 */
export interface PackageFile {
  package: EmailPackage;
}

/**
 * Get localized string value with fallback to English
 */
export function getLocalizedValue(
  localized: LocalizedString,
  lang: SupportedLang
): string {
  return localized[lang] ?? localized.en;
}

/**
 * Get localized keywords with fallback to English
 */
export function getLocalizedKeywords(
  keywords: LocalizedKeywords,
  lang: SupportedLang
): string[] {
  return keywords[lang] ?? keywords.en;
}

