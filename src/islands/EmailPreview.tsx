import { useState, useMemo } from 'preact/hooks';
import type { Recipient, Template } from '../types';
import { generateMailto, fillPlaceholders } from '../lib/mailto';

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

type EmailService = 'gmail' | 'outlook' | 'yahoo' | 'mailto' | 'copy';

function createMailtoUrl(to: string, subject: string, body: string): string {
  return generateMailto({ to, subject, body });
}

function createGmailUrl(to: string, subject: string, body: string, bcc?: string): string {
  const params = new URLSearchParams({ to, su: subject, body });
  if (bcc) params.set('bcc', bcc);
  return `https://mail.google.com/mail/?view=cm&${params.toString()}`;
}

function createOutlookUrl(to: string, subject: string, body: string, bcc?: string): string {
  const params = new URLSearchParams({ to, subject, body });
  if (bcc) params.set('bcc', bcc);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function createYahooUrl(to: string, subject: string, body: string, bcc?: string): string {
  const params = new URLSearchParams({ to, subject, body });
  if (bcc) params.set('bcc', bcc);
  return `https://compose.mail.yahoo.com/?${params.toString()}`;
}

const EMAIL_SERVICES: { id: EmailService; name: string; icon: string; color: string }[] = [
  { id: 'gmail', name: 'Gmail', icon: '📧', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' },
  { id: 'outlook', name: 'Outlook', icon: '📬', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
  { id: 'yahoo', name: 'Yahoo', icon: '📨', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' },
  { id: 'mailto', name: 'Email App', icon: '💌', color: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
  { id: 'copy', name: 'Copy All', icon: '📋', color: 'bg-white/10 text-text/70 hover:bg-white/20' },
];

export default function EmailPreview({ recipients, template, senderCountry, labels }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [showIndividualOptions, setShowIndividualOptions] = useState<string | null>(null);

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

  const allEmails = useMemo(() => emails.map((e) => e.recipient.email), [emails]);
  const primaryEmail = emails[0]?.recipient.email || '';
  const bccEmails = allEmails.slice(1).join(',');
  const primarySubject = emails[0]?.subject || '';
  const primaryBody = emails[0]?.body || '';

  const handleSendVia = (service: EmailService) => {
    if (service === 'copy') {
      copyAllEmails();
      return;
    }

    let url = '';
    switch (service) {
      case 'gmail':
        url = createGmailUrl(primaryEmail, primarySubject, primaryBody, bccEmails);
        break;
      case 'outlook':
        url = createOutlookUrl(primaryEmail, primarySubject, primaryBody, bccEmails);
        break;
      case 'yahoo':
        url = createYahooUrl(primaryEmail, primarySubject, primaryBody, bccEmails);
        break;
      case 'mailto':
        window.location.href = allRecipientsMailto;
        return;
    }

    if (url) window.open(url, '_blank');
  };

  const handleSendIndividualVia = (service: EmailService, email: typeof emails[0]) => {
    if (service === 'copy') {
      copyToClipboard(`To: ${email.recipient.email}\nSubject: ${email.subject}\n\n${email.body}`, -1);
      return;
    }

    let url = '';
    switch (service) {
      case 'gmail':
        url = createGmailUrl(email.recipient.email, email.subject, email.body);
        break;
      case 'outlook':
        url = createOutlookUrl(email.recipient.email, email.subject, email.body);
        break;
      case 'yahoo':
        url = createYahooUrl(email.recipient.email, email.subject, email.body);
        break;
      case 'mailto':
        window.location.href = createMailtoUrl(email.recipient.email, email.subject, email.body);
        return;
    }

    if (url) window.open(url, '_blank');
  };

  const MAX_MAILTO_LENGTH = 2000;

  const allRecipientsMailto = useMemo(() => {
    if (emails.length === 0) return 'mailto:';
    const primary = emails[0];
    const bccList = emails.slice(1).map((e) => e.recipient.email);
    const baseMailto = createMailtoUrl(primary.recipient.email, primary.subject, primary.body);

    if (bccList.length === 0) return baseMailto;

    const bcc = bccList.join(',');
    const fullUrl = `${baseMailto}&bcc=${encodeURIComponent(bcc)}`;

    if (fullUrl.length <= MAX_MAILTO_LENGTH) return fullUrl;

    // Truncate BCC list if URL is too long
    const availableLength = MAX_MAILTO_LENGTH - baseMailto.length - '&bcc='.length;
    let truncatedBcc = '';
    for (const email of bccList) {
      const encoded = encodeURIComponent(truncatedBcc ? `${truncatedBcc},${email}` : email);
      if (encoded.length <= availableLength) {
        truncatedBcc = truncatedBcc ? `${truncatedBcc},${email}` : email;
      } else {
        break;
      }
    }
    return truncatedBcc ? `${baseMailto}&bcc=${encodeURIComponent(truncatedBcc)}` : baseMailto;
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

      <div class="space-y-sm">
        <button
          type="button"
          onClick={() => setShowEmailOptions(!showEmailOptions)}
          class="w-full inline-flex items-center justify-center gap-sm min-h-[52px] px-lg py-sm rounded-md bg-gradient-to-r from-primary to-primary/80 text-white font-semibold text-lg shadow-lg hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          {labels.sendToAll} ({recipients.length})
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class={`h-5 w-5 transition-transform ${showEmailOptions ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        {/* Email service options dropdown */}
        {showEmailOptions && (
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-sm p-md rounded-md bg-surface/50 border border-white/10 animate-in fade-in slide-in-from-top-2">
            {EMAIL_SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleSendVia(service.id)}
                class={`flex flex-col items-center justify-center gap-xs min-h-[80px] px-sm py-md rounded-md border border-white/10 transition-all ${service.color}`}
              >
                <span class="text-2xl">{service.icon}</span>
                <span class="text-sm font-medium">
                  {service.id === 'copy' && copiedAll ? labels.copied : service.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Individual emails */}
      <div class="space-y-md" role="list" aria-label={labels.emailPreview}>
        <h3 class="text-lg font-semibold text-text">{labels.emailPreview}</h3>
        {emails.map((email, idx) => (
          <article key={email.recipient.id} class="p-md rounded-md bg-surface border border-white/10" role="listitem">
            <div class="flex items-start justify-between mb-sm">
              <div>
                <p class="font-medium text-text">{email.recipient.name}</p>
                <p class="text-sm text-text/50">{email.recipient.email}</p>
              </div>
              <div class="relative" role="group" aria-label={`Actions for ${email.recipient.name}`}>
                <button
                  type="button"
                  onClick={() => setShowIndividualOptions(showIndividualOptions === email.recipient.id ? null : email.recipient.id)}
                  class="px-sm py-xs min-h-[36px] rounded-sm bg-primary/20 text-primary text-sm hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary transition-colors inline-flex items-center gap-xs"
                >
                  {labels.send}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-4 w-4 transition-transform ${showIndividualOptions === email.recipient.id ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>

                {/* Individual email options dropdown */}
                {showIndividualOptions === email.recipient.id && (
                  <div class="absolute right-0 top-full mt-xs z-10 min-w-[180px] p-xs rounded-md bg-surface border border-white/20 shadow-xl">
                    {EMAIL_SERVICES.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          handleSendIndividualVia(service.id, email);
                          if (service.id !== 'copy') {
                            setShowIndividualOptions(null);
                          }
                        }}
                        class={`w-full flex items-center gap-sm px-sm py-xs rounded text-sm transition-all ${service.color}`}
                      >
                        <span>{service.icon}</span>
                        <span>{service.id === 'copy' && copiedIdx === idx ? labels.copied : service.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <details class="group">
              <summary class="text-sm text-text/60 cursor-pointer hover:text-text/80 list-none flex items-center gap-xs">
                <span class="truncate">{email.subject}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </summary>
              <pre class="mt-sm text-sm text-text/70 whitespace-pre-wrap font-sans bg-bg/50 p-sm rounded-sm max-h-48 overflow-y-auto">{email.body}</pre>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}

