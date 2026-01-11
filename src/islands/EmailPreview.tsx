import { useState, useMemo } from 'preact/hooks';
import type { Recipient, Template } from '../types';

interface Props {
  recipients: Recipient[];
  template: Template;
  senderCountry: string;
  labels: {
    send: string;
    copy: string;
    copied: string;
    recipientsSummary: string;
    emailPreview: string;
    sendToAll: string;
    copyAll: string;
    subject: string;
    message: string;
  };
}

/** Fill placeholders in text */
function fillPlaceholders(text: string, data: Record<string, string>): string {
  let result = text;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value);
  });
  return result;
}

/** Generate mailto URL */
function generateMailto(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function EmailPreview({ recipients, template, senderCountry, labels }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  /** Generate personalized email for each recipient */
  const emails = useMemo(() => {
    return recipients.map((r) => {
      const placeholders = { recipientName: r.name, senderCountry };
      return {
        recipient: r,
        subject: fillPlaceholders(template.subject, placeholders),
        body: fillPlaceholders(template.body, placeholders),
      };
    });
  }, [recipients, template, senderCountry]);

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { /* ignore */ }
  };

  const copyAllEmails = async () => {
    const allText = emails.map((e) => 
      `To: ${e.recipient.email}\nSubject: ${e.subject}\n\n${e.body}\n\n---\n`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { /* ignore */ }
  };

  /** Mailto with all recipients in BCC */
  const allRecipientsMailto = useMemo(() => {
    const primary = emails[0];
    const bcc = emails.slice(1).map((e) => e.recipient.email).join(',');
    const baseMailto = generateMailto(primary.recipient.email, primary.subject, primary.body);
    return bcc ? `${baseMailto}&bcc=${encodeURIComponent(bcc)}` : baseMailto;
  }, [emails]);

  return (
    <div class="space-y-lg">
      {/* Recipients summary */}
      <div class="p-md rounded-md bg-surface border border-white/10">
        <h3 class="text-sm font-semibold text-text/70 mb-sm">{labels.recipientsSummary}</h3>
        <div class="flex flex-wrap gap-sm">
          {recipients.map((r) => (
            <span key={r.id} class="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-primary/10 text-primary text-sm">
              {r.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <div class="flex flex-col sm:flex-row gap-sm">
        <a
          href={allRecipientsMailto}
          class="flex-1 inline-flex items-center justify-center gap-sm min-h-[48px] px-lg py-sm rounded-sm bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          {labels.sendToAll} ({recipients.length})
        </a>
        <button
          type="button"
          onClick={copyAllEmails}
          class="flex-1 inline-flex items-center justify-center gap-sm min-h-[48px] px-lg py-sm rounded-sm bg-surface border border-white/20 text-text hover:bg-white/10 transition-colors"
        >
          {copiedAll ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {labels.copied}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              {labels.copyAll}
            </>
          )}
        </button>
      </div>

      {/* Individual emails */}
      <div class="space-y-md">
        <h3 class="text-lg font-semibold text-text">{labels.emailPreview}</h3>
        {emails.map((email, idx) => (
          <div key={email.recipient.id} class="p-md rounded-md bg-surface border border-white/10">
            <div class="flex items-start justify-between mb-sm">
              <div>
                <p class="font-medium text-text">{email.recipient.name}</p>
                <p class="text-sm text-text/50">{email.recipient.email}</p>
              </div>
              <div class="flex gap-sm">
                <a
                  href={generateMailto(email.recipient.email, email.subject, email.body)}
                  class="px-sm py-xs min-h-[36px] rounded-sm bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors inline-flex items-center"
                >
                  {labels.send}
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`To: ${email.recipient.email}\nSubject: ${email.subject}\n\n${email.body}`, idx)}
                  class="px-sm py-xs min-h-[36px] rounded-sm bg-white/10 text-text/70 text-sm hover:bg-white/20 transition-colors"
                >
                  {copiedIdx === idx ? labels.copied : labels.copy}
                </button>
              </div>
            </div>
            <details class="group">
              <summary class="text-sm text-text/60 cursor-pointer hover:text-text/80 list-none flex items-center gap-xs">
                <span class="truncate">{email.subject}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </summary>
              <pre class="mt-sm text-sm text-text/70 whitespace-pre-wrap font-sans bg-bg/50 p-sm rounded-sm max-h-48 overflow-y-auto">{email.body}</pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

