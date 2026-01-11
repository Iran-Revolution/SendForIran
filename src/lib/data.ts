import type { Recipient, RecipientFile, Template, TemplateFile, CountryCode, RecipientCategory } from '../types';

export interface Country { code: CountryCode; flag: string; recipientCount: number; }

const FLAGS: Record<CountryCode, string> = { 'united-states': '🇺🇸', 'united-kingdom': '🇬🇧', 'germany': '🇩🇪', 'france': '🇫🇷', 'canada': '🇨🇦' };
const NAMES: Record<CountryCode, string> = { 'united-states': 'the United States', 'united-kingdom': 'the United Kingdom', 'germany': 'Germany', 'france': 'France', 'canada': 'Canada' };
export const countryCodes: CountryCode[] = ['united-states', 'united-kingdom', 'germany', 'france', 'canada'];
export const allCategories: RecipientCategory[] = ['journalist', 'media', 'government', 'mp'];

export async function getRecipients(country: string): Promise<Recipient[]> {
  const files = import.meta.glob<RecipientFile>('../../data/recipients/*.json', { eager: true });
  const file = files[`../../data/recipients/${country}.json`];
  if (!file) return [];
  file.recipients.forEach((r, i) => { if (!r.id || !r.name || !r.email) throw new Error(`Invalid recipient at ${i} for ${country}`); });
  return file.recipients;
}

export async function getTemplates(country: string, lang = 'en'): Promise<Template[]> {
  const files = import.meta.glob<TemplateFile | Template>('../../data/templates/countries/**/*.json', { eager: true });
  for (const tryLang of [lang, 'en', 'de', 'fr']) {
    const prefix = `../../data/templates/countries/${country}/${tryLang}/`;
    const matches = Object.entries(files).filter(([p]) => p.startsWith(prefix));
    if (matches.length) {
      return matches.map(([, f]) => {
        const t = 'template' in f ? f.template : f;
        if (!t.id || !t.subject || !t.body) throw new Error('Invalid template');
        return t as Template;
      });
    }
  }
  return [];
}

export async function getCountries(): Promise<Country[]> {
  return Promise.all(countryCodes.map(async code => ({ code, flag: FLAGS[code], recipientCount: (await getRecipients(code)).length })));
}

export function getSenderCountryName(code: CountryCode): string { return NAMES[code] || code; }

export async function getCategoryCounts(country: string): Promise<Record<RecipientCategory, number>> {
  const counts: Record<RecipientCategory, number> = { journalist: 0, media: 0, government: 0, mp: 0 };
  (await getRecipients(country)).forEach(r => { if (r.type in counts) counts[r.type]++; });
  return counts;
}

export async function getRecipientsByCategories(country: string, categories: RecipientCategory[]): Promise<Recipient[]> {
  return (await getRecipients(country)).filter(r => categories.includes(r.type));
}

export async function getTemplatesForCategories(country: string, lang: string, categories: RecipientCategory[]): Promise<Template[]> {
  return (await getTemplates(country, lang)).filter(t => t.recipientTypes.some(type => categories.includes(type)));
}

export function parseCategories(str: string): RecipientCategory[] {
  return str.split(',').map(c => c.trim() as RecipientCategory).filter(c => allCategories.includes(c));
}

export function getAllCategoryCombinations(): string[] {
  const cats = allCategories;
  const combos: string[] = [...cats];
  for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) combos.push(`${cats[i]},${cats[j]}`);
  for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) for (let k = j + 1; k < cats.length; k++) combos.push(`${cats[i]},${cats[j]},${cats[k]}`);
  combos.push(cats.join(','));
  return combos;
}
