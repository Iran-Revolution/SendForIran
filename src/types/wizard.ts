/**
 * Wizard flow type definitions for SendForIran
 */

import type { RecipientCategory, Recipient, CountryCode } from './recipient';
import type { Template } from './template';

/** Wizard step identifiers */
export type WizardStep = 'country' | 'category' | 'recipients' | 'template' | 'compose';

/** Category information with recipient count */
export interface CategoryInfo {
  type: RecipientCategory;
  count: number;
  icon: string;
}

/** Wizard state for client-side navigation */
export interface WizardState {
  country: CountryCode | null;
  category: RecipientCategory | null;
  selectedRecipients: string[]; // recipient IDs
  template: Template | null;
}

/** Props for wizard step components */
export interface WizardStepProps {
  currentStep: WizardStep;
  country: CountryCode;
  lang: string;
}

/** Category metadata for display */
export const categoryMeta: Record<RecipientCategory, { icon: string; color: string }> = {
  journalist: { icon: '📰', color: 'blue' },
  media: { icon: '📺', color: 'purple' },
  government: { icon: '🏛️', color: 'amber' },
  mp: { icon: '🗳️', color: 'emerald' },
};

/** All supported categories */
export const allCategories: RecipientCategory[] = ['journalist', 'media', 'government', 'mp'];

