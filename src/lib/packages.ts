/**
 * Package loading utilities for SendForIran
 * Handles loading, filtering, and randomization of email packages
 */

import type {
  EmailPackage,
  PackageFile,
  PackagePriority,
  Recipient
} from '../types';
import type { CountryCode } from '../types/recipient';
import type { SupportedLang } from './i18n';
import { getLocalizedValue } from '../types/package';

/**
 * Randomizer configuration options
 */
export interface RandomizerOptions {
  /** Number of recent packages to avoid repeating */
  avoidRecentCount: number;
  /** Weight multiplier for priority (higher = more influence) */
  priorityWeight: number;
  /** Whether to favor newer packages */
  timeDecay: boolean;
}

const DEFAULT_RANDOMIZER_OPTIONS: RandomizerOptions = {
  avoidRecentCount: 3,
  priorityWeight: 1.5,
  timeDecay: false
};

/**
 * Get all packages for a specific country and language
 * Falls back to English if requested language not available
 */
export async function getPackages(
  country: CountryCode,
  lang: SupportedLang = 'en'
): Promise<EmailPackage[]> {
  const packageFiles = import.meta.glob<PackageFile | EmailPackage>(
    '../../data/packages/**/*.json',
    { eager: true }
  );

  const packages: EmailPackage[] = [];

  // Try requested language first, then fall back to English
  const langPriority = [lang, 'en'];
  let foundLang: string | null = null;

  for (const tryLang of langPriority) {
    const prefix = `../../data/packages/${country}/${tryLang}/`;
    const matchingFiles = Object.entries(packageFiles).filter(([path]) =>
      path.startsWith(prefix)
    );

    if (matchingFiles.length > 0) {
      foundLang = tryLang;
      matchingFiles.forEach(([, file]) => {
        // Handle both {package: EmailPackage} and direct EmailPackage format
        const pkg = 'package' in file ? file.package : file;

        // Validate required fields
        if (!pkg.id || !pkg.template?.subject || !pkg.template?.body) {
          throw new Error(`Invalid package: missing required fields`);
        }

        packages.push(pkg as EmailPackage);
      });
      break;
    }
  }



  // Sort by priority (1 = highest)
  return packages.sort((a, b) => a.meta.priority - b.meta.priority);
}

/**
 * Get a single package by ID
 */
export async function getPackageById(
  country: CountryCode,
  packageId: string,
  lang: SupportedLang = 'en'
): Promise<EmailPackage | null> {
  const packages = await getPackages(country, lang);
  return packages.find(p => p.id === packageId) || null;
}

/**
 * Get featured packages for a country (limited count)
 */
export async function getFeaturedPackages(
  country: CountryCode,
  lang: SupportedLang = 'en',
  limit: number = 5
): Promise<EmailPackage[]> {
  const packages = await getPackages(country, lang);

  // Prioritize featured packages, then by priority
  return packages
    .sort((a, b) => {
      if (a.ui.featured && !b.ui.featured) return -1;
      if (!a.ui.featured && b.ui.featured) return 1;
      return a.meta.priority - b.meta.priority;
    })
    .slice(0, limit);
}

/**
 * Select a random package using weighted algorithm
 */
export function selectRandomPackage(
  packages: EmailPackage[],
  history: string[] = [],
  options: Partial<RandomizerOptions> = {}
): EmailPackage | null {
  if (packages.length === 0) return null;

  const opts = { ...DEFAULT_RANDOMIZER_OPTIONS, ...options };

  // Filter out recently shown packages
  const recentIds = history.slice(-opts.avoidRecentCount);
  let available = packages.filter(p => !recentIds.includes(p.id));

  // If all packages were recently shown, reset to all
  if (available.length === 0) {
    available = packages;
  }

  // Calculate weighted scores
  const scored = available.map(pkg => ({
    package: pkg,
    score: calculatePackageScore(pkg, opts)
  }));

  // Weighted random selection
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  let random = Math.random() * totalScore;

  for (const item of scored) {
    random -= item.score;
    if (random <= 0) return item.package;
  }

  return scored[0]?.package || null;
}

/**
 * Calculate package score for weighted selection
 */
function calculatePackageScore(
  pkg: EmailPackage,
  options: RandomizerOptions
): number {
  let score = 1;

  // Priority boost (1=high priority gets highest score)
  score *= Math.pow(4 - pkg.meta.priority, options.priorityWeight);

  // Featured boost
  if (pkg.ui.featured) {
    score *= 1.5;
  }

  // Time decay (if enabled)
  if (options.timeDecay && pkg.meta.updated) {
    const daysSince = (Date.now() - new Date(pkg.meta.updated).getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-daysSince / 30); // Decay over 30 days
  }

  return Math.max(score, 0.1); // Minimum score to prevent zero
}

// ========================================
// Dice History Management (Client-side)
// ========================================

const DICE_HISTORY_KEY = 'sendforiran_dice_history';
const MAX_HISTORY_LENGTH = 10;

/**
 * Dice history state per country
 */
export interface DiceHistoryEntry {
  history: string[];
  lastRoll: number;
  totalRolls: number;
}

export interface DiceHistory {
  [country: string]: DiceHistoryEntry;
}

/**
 * Get dice history from localStorage (client-side only)
 */
export function getDiceHistory(): DiceHistory {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(DICE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get history for a specific country
 */
export function getCountryDiceHistory(country: CountryCode): DiceHistoryEntry {
  const history = getDiceHistory();
  return history[country] || {
    history: [],
    lastRoll: 0,
    totalRolls: 0
  };
}

/**
 * Record a package selection in history
 */
export function recordDiceRoll(country: CountryCode, packageId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const allHistory = getDiceHistory();
    const countryHistory = allHistory[country] || {
      history: [],
      lastRoll: 0,
      totalRolls: 0
    };

    // Add to history, keeping max length
    countryHistory.history = [
      ...countryHistory.history.slice(-(MAX_HISTORY_LENGTH - 1)),
      packageId
    ];
    countryHistory.lastRoll = Date.now();
    countryHistory.totalRolls += 1;

    allHistory[country] = countryHistory;
    localStorage.setItem(DICE_HISTORY_KEY, JSON.stringify(allHistory));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear dice history for a country
 */
export function clearDiceHistory(country?: CountryCode): void {
  if (typeof window === 'undefined') return;

  try {
    if (country) {
      const history = getDiceHistory();
      delete history[country];
      localStorage.setItem(DICE_HISTORY_KEY, JSON.stringify(history));
    } else {
      localStorage.removeItem(DICE_HISTORY_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

// ========================================
// Recipient Resolution
// ========================================

/**
 * Resolve recipient IDs to full recipient objects
 */
export function resolveRecipients(
  pkg: EmailPackage,
  allRecipients: Recipient[]
): Recipient[] {
  const recipientMap = new Map(allRecipients.map(r => [r.id, r]));
  return pkg.recipients.ids
    .map(id => recipientMap.get(id))
    .filter((r): r is Recipient => r !== undefined);
}

/**
 * Get package display title in specified language
 */
export function getPackageTitle(pkg: EmailPackage, lang: SupportedLang): string {
  return getLocalizedValue(pkg.display.title, lang);
}

/**
 * Get package description in specified language
 */
export function getPackageDescription(pkg: EmailPackage, lang: SupportedLang): string {
  return getLocalizedValue(pkg.display.description, lang);
}

// ========================================
// SSR Data Loading Functions
// ========================================

/**
 * Load all packages for a country (SSR-compatible)
 * Alias for getPackages for clearer naming in page components
 */
export async function loadPackagesForCountry(
  country: CountryCode,
  lang: SupportedLang = 'en'
): Promise<EmailPackage[]> {
  return getPackages(country, lang);
}

/**
 * Load all recipients for a country (SSR-compatible)
 */
export async function loadRecipientsForCountry(
  country: CountryCode
): Promise<Recipient[]> {
  const recipientFiles = import.meta.glob<{ default: Recipient[] } | Recipient[]>(
    '../../data/recipients/**/*.json',
    { eager: true }
  );

  const recipients: Recipient[] = [];
  const prefix = `../../data/recipients/${country}/`;

  for (const [path, file] of Object.entries(recipientFiles)) {
    if (path.startsWith(prefix)) {
      // Handle both default export and direct array
      const data = 'default' in file ? file.default : file;
      if (Array.isArray(data)) {
        recipients.push(...data);
      }
    }
  }

  return recipients;
}
