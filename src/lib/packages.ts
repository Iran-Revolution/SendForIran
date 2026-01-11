import type { EmailPackage, PackageFile, Recipient } from '../types';
import type { CountryCode } from '../types/recipient';

export interface RandomizerOptions {
  avoidRecentCount: number;
}

const DEFAULT_OPTS: RandomizerOptions = { avoidRecentCount: 3 };

async function getPackages(country: CountryCode): Promise<EmailPackage[]> {
  const files = import.meta.glob<PackageFile | EmailPackage>('../../data/packages/**/*.json', { eager: true });
  const packages: EmailPackage[] = [];
  const prefix = `../../data/packages/${country}/`;

  for (const [path, file] of Object.entries(files)) {
    if (path.startsWith(prefix) && !path.slice(prefix.length).includes('/')) {
      const pkg = 'package' in file ? file.package : file;
      if (!pkg.id || !pkg.template?.subject || !pkg.template?.body) throw new Error('Invalid package');
      packages.push(pkg as EmailPackage);
    }
  }
  // Sort alphabetically by id for consistent ordering
  return packages.sort((a, b) => a.id.localeCompare(b.id));
}

export function selectRandomPackage(packages: EmailPackage[], history: string[] = [], options: Partial<RandomizerOptions> = {}): EmailPackage | null {
  if (!packages.length) return null;
  const opts = { ...DEFAULT_OPTS, ...options };
  const recentIds = history.slice(-opts.avoidRecentCount);
  let available = packages.filter(p => !recentIds.includes(p.id));
  if (!available.length) available = packages;

  // Simple random selection with equal weight
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || null;
}

const DICE_KEY = 'sendforiran_dice_history';
const MAX_HISTORY = 10;

export interface DiceHistoryEntry { history: string[]; lastRoll: number; totalRolls: number; }
export interface DiceHistory { [country: string]: DiceHistoryEntry; }

export function getDiceHistory(): DiceHistory {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(DICE_KEY) || '{}'); } catch { return {}; }
}

export function getCountryDiceHistory(country: CountryCode): DiceHistoryEntry {
  return getDiceHistory()[country] || { history: [], lastRoll: 0, totalRolls: 0 };
}

export function recordDiceRoll(country: CountryCode, packageId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getDiceHistory();
    const entry = all[country] || { history: [], lastRoll: 0, totalRolls: 0 };
    entry.history = [...entry.history.slice(-(MAX_HISTORY - 1)), packageId];
    entry.lastRoll = Date.now();
    entry.totalRolls += 1;
    all[country] = entry;
    localStorage.setItem(DICE_KEY, JSON.stringify(all));
  } catch (_e) {
    // Silently ignore localStorage errors (e.g., private browsing)
  }
}

export function resolveRecipients(pkg: EmailPackage, allRecipients: Recipient[]): Recipient[] {
  const map = new Map(allRecipients.map(r => [r.id, r]));
  return pkg.recipients.ids.map(id => map.get(id)).filter((r): r is Recipient => !!r);
}

export async function loadPackagesForCountry(country: CountryCode): Promise<EmailPackage[]> {
  return getPackages(country);
}

export async function loadRecipientsForCountry(country: CountryCode): Promise<Recipient[]> {
  const files = import.meta.glob<{ default: Recipient[] } | Recipient[]>('../../data/recipients/**/*.json', { eager: true });
  const recipients: Recipient[] = [];
  const prefix = `../../data/recipients/${country}/`;
  for (const [path, file] of Object.entries(files)) {
    if (path.startsWith(prefix)) {
      const data = 'default' in file ? file.default : file;
      if (Array.isArray(data)) recipients.push(...data);
    }
  }
  return recipients;
}
