/**
 * Mailto utility functions for SendForIran
 * Generates mailto: links and handles placeholder replacement
 */

export interface MailtoParams {
  to: string;
  subject: string;
  body: string;
}

/** Maximum mailto URL length (safe limit across email clients) */
const MAX_MAILTO_LENGTH = 2000;

/**
 * Generate a mailto: URL with encoded parameters
 * Truncates body if the URL exceeds the safe limit
 */
export function generateMailto(params: MailtoParams): string {
  const { to, subject, body } = params;
  
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  let mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodedSubject}&body=${encodedBody}`;
  
  // Truncate body if URL is too long
  if (mailtoUrl.length > MAX_MAILTO_LENGTH) {
    const truncatedBody = truncateForMailto(body, MAX_MAILTO_LENGTH - 200);
    mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodedSubject}&body=${encodeURIComponent(truncatedBody)}`;
  }
  
  return mailtoUrl;
}

/**
 * Truncate text to fit within mailto URL limits
 * Adds ellipsis and note about truncation
 */
function truncateForMailto(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncateNote = '\n\n[Message truncated due to email client limitations]';
  const truncatedLength = maxLength - truncateNote.length;
  
  return text.slice(0, truncatedLength) + truncateNote;
}

/**
 * Replace placeholders in text with actual values
 * Supports: {{recipientName}}, {{senderCountry}}, {{currentDate}}
 */
export function fillPlaceholders(
  text: string, 
  data: Record<string, string>
): string {
  let result = text;
  
  // Replace standard placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value);
  });
  
  // Handle {{currentDate}} automatically if not provided
  if (result.includes('{{currentDate}}') && !data.currentDate) {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    result = result.replaceAll('{{currentDate}}', today);
  }
  
  return result;
}

/**
 * Generate a complete mailto URL with placeholders filled
 */
export function generateEmailLink(
  to: string,
  subject: string,
  body: string,
  placeholders: Record<string, string>
): string {
  const filledSubject = fillPlaceholders(subject, placeholders);
  const filledBody = fillPlaceholders(body, placeholders);
  
  return generateMailto({
    to,
    subject: filledSubject,
    body: filledBody,
  });
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers/non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

