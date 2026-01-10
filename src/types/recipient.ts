/**
 * Recipient type definitions for SendForIran
 */

/** Types of recipients for email targeting */
export type RecipientCategory = 'journalist' | 'media' | 'government' | 'mp';

/** Priority levels for recipients (1 = highest priority) */
export type Priority = 1 | 2 | 3;

/** Country slugs supported by the platform (using full names to avoid conflict with language codes) */
export type CountryCode = 'united-states' | 'united-kingdom' | 'germany' | 'france' | 'canada';

/**
 * Recipient contact information
 */
export interface Recipient {
  id: string;
  name: string;
  title: string;
  organization: string;
  type: RecipientCategory;
  email: string;
  country: CountryCode;
  priority: Priority;
}

/** Recipient file structure as stored in JSON */
export interface RecipientFile {
  recipients: Recipient[];
}

