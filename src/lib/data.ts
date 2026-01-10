/**
 * Data loading utilities for SendForIran
 * Uses import.meta.glob for dynamic JSON loading at build time
 */

import type { Recipient, RecipientFile, Template, TemplateFile, CountryCode } from '../types';

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

