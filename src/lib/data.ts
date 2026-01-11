/**
 * Data loading utilities for SendForIran
 * Uses import.meta.glob for dynamic JSON loading at build time
 */

import type { Recipient, RecipientFile, Template, TemplateFile, CountryCode, RecipientCategory } from '../types';

/** Country display information */
export interface Country {
  code: CountryCode;
  flag: string;
  recipientCount: number;
}

/** Country metadata with flags */
const countryMeta: Record<CountryCode, { flag: string }> = {
  'united-states': { flag: '🇺🇸' },
  'united-kingdom': { flag: '🇬🇧' },
  'germany': { flag: '🇩🇪' },
  'france': { flag: '🇫🇷' },
  'canada': { flag: '🇨🇦' },
};

/** All supported country slugs */
export const countryCodes: CountryCode[] = ['united-states', 'united-kingdom', 'germany', 'france', 'canada'];

/**
 * Get recipients for a specific country
 * Validates at build time and throws if missing required fields
 */
export async function getRecipients(country: string): Promise<Recipient[]> {
  const recipientFiles = import.meta.glob<RecipientFile>(
    '../../data/recipients/*.json',
    { eager: true }
  );

  const filePath = `../../data/recipients/${country}.json`;
  const file = recipientFiles[filePath];

  if (!file) {
    console.warn(`No recipients found for country: ${country}`);
    return [];
  }

  const recipients = file.recipients;

  // Validate required fields
  recipients.forEach((r, index) => {
    if (!r.id || !r.name || !r.email) {
      throw new Error(
        `Invalid recipient at index ${index} for ${country}: missing required fields`
      );
    }
  });

  return recipients;
}

/**
 * Get templates for a specific country and language
 * Falls back to English if requested language not available
 */
export async function getTemplates(
  country: string,
  lang: string = 'en'
): Promise<Template[]> {
  const templateFiles = import.meta.glob<TemplateFile | Template>(
    '../../data/templates/countries/**/*.json',
    { eager: true }
  );

  const templates: Template[] = [];
  
  // Try requested language first, then fall back to English or native language
  const langPriority = [lang, 'en', 'de', 'fr'];
  let foundLang: string | null = null;

  for (const tryLang of langPriority) {
    const prefix = `../../data/templates/countries/${country}/${tryLang}/`;
    const matchingFiles = Object.entries(templateFiles).filter(([path]) =>
      path.startsWith(prefix)
    );

    if (matchingFiles.length > 0) {
      foundLang = tryLang;
      matchingFiles.forEach(([, file]) => {
        // Handle both {template: Template} and direct Template format
        const template = 'template' in file ? file.template : file;
        
        // Validate required fields
        if (!template.id || !template.subject || !template.body) {
          throw new Error(`Invalid template: missing required fields`);
        }
        
        templates.push(template as Template);
      });
      break;
    }
  }

  if (!foundLang) {
    console.warn(`No templates found for ${country} in any language`);
  }

  return templates;
}

/**
 * Get all countries with recipient counts
 */
export async function getCountries(): Promise<Country[]> {
  const countries: Country[] = [];

  for (const code of countryCodes) {
    const recipients = await getRecipients(code);
    const meta = countryMeta[code];

    countries.push({
      code,
      flag: meta.flag,
      recipientCount: recipients.length,
    });
  }

  return countries;
}

/**
 * Get sender country name based on country slug
 */
export function getSenderCountryName(code: CountryCode, _lang: string = 'en'): string {
  const names: Record<CountryCode, string> = {
    'united-states': 'the United States',
    'united-kingdom': 'the United Kingdom',
    'germany': 'Germany',
    'france': 'France',
    'canada': 'Canada',
  };
  return names[code] || code;
}

/** All supported categories */
export const allCategories: RecipientCategory[] = ['journalist', 'media', 'government', 'mp'];

/** Get recipient counts by category for a country */
export async function getCategoryCounts(country: string): Promise<Record<RecipientCategory, number>> {
  const recipients = await getRecipients(country);
  const counts: Record<RecipientCategory, number> = { journalist: 0, media: 0, government: 0, mp: 0 };
  recipients.forEach((r) => { if (r.type in counts) counts[r.type]++; });
  return counts;
}

/** Get recipients filtered by multiple categories */
export async function getRecipientsByCategories(country: string, categories: RecipientCategory[]): Promise<Recipient[]> {
  const allRecipients = await getRecipients(country);
  return allRecipients.filter((r) => categories.includes(r.type));
}

/**
 * Get templates that match any of the given categories
 */
export async function getTemplatesForCategories(
  country: string,
  lang: string,
  categories: RecipientCategory[]
): Promise<Template[]> {
  const allTemplates = await getTemplates(country, lang);
  return allTemplates.filter((t) =>
    t.recipientTypes.some((type) => categories.includes(type))
  );
}

/**
 * Parse comma-separated category string into array
 */
export function parseCategories(categoryString: string): RecipientCategory[] {
  return categoryString
    .split(',')
    .map(c => c.trim() as RecipientCategory)
    .filter(c => allCategories.includes(c));
}

/**
 * Generate all possible category combinations for static paths
 */
export function getAllCategoryCombinations(): string[] {
  const combinations: string[] = [];

  // Single categories
  for (const cat of allCategories) {
    combinations.push(cat);
  }

  // Two category combinations
  for (let i = 0; i < allCategories.length; i++) {
    for (let j = i + 1; j < allCategories.length; j++) {
      combinations.push(`${allCategories[i]},${allCategories[j]}`);
    }
  }

  // Three category combinations
  for (let i = 0; i < allCategories.length; i++) {
    for (let j = i + 1; j < allCategories.length; j++) {
      for (let k = j + 1; k < allCategories.length; k++) {
        combinations.push(`${allCategories[i]},${allCategories[j]},${allCategories[k]}`);
      }
    }
  }

  // All four categories
  combinations.push(allCategories.join(','));

  return combinations;
}

