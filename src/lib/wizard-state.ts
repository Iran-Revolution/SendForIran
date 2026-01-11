/**
 * Wizard state management using localStorage
 * Privacy-first: all data stays in browser, no external calls
 */

import type { RecipientCategory, CountryCode } from '../types';

/** Wizard state stored in localStorage */
export interface WizardLocalState {
  country: CountryCode | null;
  categories: RecipientCategory[];
  recipientIds: string[];
  templateId: string | null;
  timestamp: number;
}

const STORAGE_KEY = 'sendforiran_wizard_state';
const STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Get default empty state */
function getDefaultState(): WizardLocalState {
  return {
    country: null,
    categories: [],
    recipientIds: [],
    templateId: null,
    timestamp: Date.now(),
  };
}

/** Check if we're in a browser environment */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/** Load wizard state from localStorage */
export function loadWizardState(): WizardLocalState {
  if (!isBrowser()) return getDefaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();

    const state = JSON.parse(stored) as WizardLocalState;
    
    // Check if state has expired
    if (Date.now() - state.timestamp > STATE_TTL_MS) {
      clearWizardState();
      return getDefaultState();
    }
    
    return state;
  } catch {
    return getDefaultState();
  }
}

/** Save wizard state to localStorage */
export function saveWizardState(state: Partial<WizardLocalState>): void {
  if (!isBrowser()) return;

  try {
    const current = loadWizardState();
    const updated: WizardLocalState = {
      ...current,
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail - localStorage might be full or disabled
  }
}

/** Clear wizard state from localStorage */
export function clearWizardState(): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/** Set selected country */
export function setCountry(country: CountryCode): void {
  saveWizardState({ country, categories: [], recipientIds: [], templateId: null });
}

/** Set selected categories */
export function setCategories(categories: RecipientCategory[]): void {
  saveWizardState({ categories, recipientIds: [], templateId: null });
}

/** Set selected recipient IDs */
export function setRecipientIds(recipientIds: string[]): void {
  saveWizardState({ recipientIds, templateId: null });
}

/** Set selected template ID */
export function setTemplateId(templateId: string): void {
  saveWizardState({ templateId });
}

/** Get current country */
export function getCountry(): CountryCode | null {
  return loadWizardState().country;
}

/** Get selected categories */
export function getCategories(): RecipientCategory[] {
  return loadWizardState().categories;
}

/** Get selected recipient IDs */
export function getRecipientIds(): string[] {
  return loadWizardState().recipientIds;
}

/** Get selected template ID */
export function getTemplateId(): string | null {
  return loadWizardState().templateId;
}

