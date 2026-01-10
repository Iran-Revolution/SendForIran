/**
 * Template type definitions for SendForIran
 */

/** Template types for different advocacy scenarios */
export type TemplateType = 'urgent' | 'awareness' | 'action' | 'sanctions';

/** Recipient types that templates can target */
export type RecipientType = 'journalist' | 'media' | 'government' | 'mp';

/** Template variation for spam filter avoidance */
export interface TemplateVariation {
  subject: string;
  body: string;
}

/** Source citation for credibility */
export interface Source {
  name: string;
  url: string;
}

/**
 * Email template with variations and sources
 * Use {{recipientName}} and {{senderCountry}} placeholders in body
 */
export interface Template {
  id: string;
  type: TemplateType;
  recipientTypes: RecipientType[];
  subject: string;
  body: string;
  variations: TemplateVariation[];
  sources: Source[];
}

/** Template file structure as stored in JSON */
export interface TemplateFile {
  template: Template;
}

