import type { Recipient, RecipientFile, CountryCode } from '../types';

export interface Country { code: CountryCode; flag: string; recipientCount: number; }

const FLAGS: Record<CountryCode, string> = { 'united-states': '🇺🇸', 'united-kingdom': '🇬🇧', 'germany': '🇩🇪', 'france': '🇫🇷', 'canada': '🇨🇦' };
export const countryCodes: CountryCode[] = ['united-states', 'united-kingdom', 'germany', 'france', 'canada'];

export async function getRecipients(country: string): Promise<Recipient[]> {
  const files = import.meta.glob<RecipientFile>('../../data/recipients/*.json', { eager: true });
  const file = files[`../../data/recipients/${country}.json`];
  if (!file) return [];
  file.recipients.forEach((r, i) => { if (!r.id || !r.name || !r.email) throw new Error(`Invalid recipient at ${i} for ${country}`); });
  return file.recipients;
}

export async function getCountries(): Promise<Country[]> {
  return Promise.all(countryCodes.map(async code => ({ code, flag: FLAGS[code], recipientCount: (await getRecipients(code)).length })));
}
