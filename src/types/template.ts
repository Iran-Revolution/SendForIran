/**
 * Template type definitions for SendForIran
 */

/** Template types for different advocacy scenarios */
export type TemplateType = 'urgent' | 'awareness' | 'action' | 'sanctions';

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

