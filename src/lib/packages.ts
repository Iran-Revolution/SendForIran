import type { EmailPackage, PackageFile, Recipient } from '../types';
import type { CountryCode } from '../types/recipient';
import type { SupportedLang } from './i18n';

export interface RandomizerOptions {
  avoidRecentCount: number;
  priorityWeight: number;
  timeDecay: boolean;
}

const DEFAULT_OPTS: RandomizerOptions = { avoidRecentCount: 3, priorityWeight: 1.5, timeDecay: false };

async function getPackages(country: CountryCode, lang: SupportedLang = 'en'): Promise<EmailPackage[]> {
  const files = import.meta.glob<PackageFile | EmailPackage>('../../data/packages/**/*.json', { eager: true });
  const packages: EmailPackage[] = [];

  for (const tryLang of [lang, 'en']) {
    const prefix = `../../data/packages/${country}/${tryLang}/`;
    const matches = Object.entries(files).filter(([p]) => p.startsWith(prefix));
    if (matches.length > 0) {
      matches.forEach(([, file]) => {
        const pkg = 'package' in file ? file.package : file;
        if (!pkg.id || !pkg.template?.subject || !pkg.template?.body) throw new Error('Invalid package');
        packages.push(pkg as EmailPackage);
      });
      break;
    }
  }
  return packages.sort((a, b) => a.meta.priority - b.meta.priority);
}

export function selectRandomPackage(packages: EmailPackage[], history: string[] = [], options: Partial<RandomizerOptions> = {}): EmailPackage | null {
  if (!packages.length) return null;
  const opts = { ...DEFAULT_OPTS, ...options };
  const recentIds = history.slice(-opts.avoidRecentCount);
  let available = packages.filter(p => !recentIds.includes(p.id));
  if (!available.length) available = packages;

  const scored = available.map(pkg => {
    let score = Math.pow(4 - pkg.meta.priority, opts.priorityWeight);
    if (pkg.ui.featured) score *= 1.5;
    if (opts.timeDecay && pkg.meta.updated) {
      score *= Math.exp(-(Date.now() - new Date(pkg.meta.updated).getTime()) / (1000 * 60 * 60 * 24 * 30));
    }
    return { package: pkg, score: Math.max(score, 0.1) };
  });

  const total = scored.reduce((s, i) => s + i.score, 0);
  let rand = Math.random() * total;
  for (const item of scored) { rand -= item.score; if (rand <= 0) return item.package; }
  return scored[0]?.package || null;
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

export async function loadPackagesForCountry(country: CountryCode, lang: SupportedLang = 'en'): Promise<EmailPackage[]> {
  return getPackages(country, lang);
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
