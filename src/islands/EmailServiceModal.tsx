/**
 * EmailServiceModal - Modal for selecting email service/client
 * Provides options for Gmail, Outlook, Yahoo, default mailto, and copy to clipboard
 */
import { useState, useEffect, useCallback } from 'preact/hooks';
import { copyToClipboard } from '../lib/mailto';

export type EmailService = 'gmail' | 'outlook' | 'yahoo' | 'mailto' | 'copy';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  bcc?: string;
}

interface Props {
  isOpen: boolean;
  emailData: EmailData | null;
  onClose: () => void;
  labels: {
    chooseService: string;
    gmail: string;
    outlook: string;
    yahoo: string;
    defaultEmail: string;
    copyToClipboard: string;
    copied: string;
    close: string;
    sendVia: string;
  };
}

function createGmailUrl(data: EmailData): string {
  const params = new URLSearchParams({ to: data.to, su: data.subject, body: data.body });
  if (data.bcc) params.set('bcc', data.bcc);
  return `https://mail.google.com/mail/?view=cm&${params.toString()}`;
}

function createOutlookUrl(data: EmailData): string {
  const params = new URLSearchParams({ to: data.to, subject: data.subject, body: data.body });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function createYahooUrl(data: EmailData): string {
  const params = new URLSearchParams({ to: data.to, subject: data.subject, body: data.body });
  return `https://compose.mail.yahoo.com/?${params.toString()}`;
}

function createMailtoUrl(data: EmailData): string {
  const params = new URLSearchParams({ subject: data.subject, body: data.body });
  return `mailto:${data.to}?${params.toString()}`;
}

export default function EmailServiceModal({ isOpen, emailData, onClose, labels }: Props) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  const handleServiceSelect = useCallback(async (service: EmailService) => {
    if (!emailData) return;

    if (service === 'copy') {
      const emailText = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
      const success = await copyToClipboard(emailText);
      if (success) {
        setCopied(true);
        setTimeout(() => onClose(), 1500);
      }
      return;
    }

    let url: string;
    switch (service) {
      case 'gmail':
        url = createGmailUrl(emailData);
        break;
      case 'outlook':
        url = createOutlookUrl(emailData);
        break;
      case 'yahoo':
        url = createYahooUrl(emailData);
        break;
      default:
        url = createMailtoUrl(emailData);
    }

    window.open(url, '_blank');
    onClose();
  }, [emailData, onClose]);

  if (!isOpen || !emailData) return null;

  const services = [
    { id: 'gmail' as EmailService, label: labels.gmail, icon: '📧', color: 'from-red-500/20 to-red-500/5' },
    { id: 'outlook' as EmailService, label: labels.outlook, icon: '📬', color: 'from-blue-500/20 to-blue-500/5' },
    { id: 'yahoo' as EmailService, label: labels.yahoo, icon: '📨', color: 'from-purple-500/20 to-purple-500/5' },
    { id: 'mailto' as EmailService, label: labels.defaultEmail, icon: '✉️', color: 'from-gray-500/20 to-gray-500/5' },
    { id: 'copy' as EmailService, label: copied ? labels.copied : labels.copyToClipboard, icon: copied ? '✓' : '📋', color: 'from-green-500/20 to-green-500/5' },
  ];

  return (
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-md" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div class="relative w-full max-w-md bg-surface border border-white/10 rounded-xl shadow-2xl animate-modal-enter">
        <div class="flex items-center justify-between p-md border-b border-white/10">
          <h2 class="text-lg font-bold text-text">{labels.chooseService}</h2>
          <button onClick={onClose} class="p-sm text-text/50 hover:text-text hover:bg-white/5 rounded-lg transition-colors" aria-label={labels.close}>✕</button>
        </div>
        <div class="p-md space-y-sm">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              class={`w-full flex items-center gap-md p-md rounded-lg border border-white/10 bg-gradient-to-r ${service.color} hover:border-primary/50 hover:scale-[1.02] transition-all`}
            >
              <span class="text-2xl">{service.icon}</span>
              <span class="text-text font-medium">{labels.sendVia} {service.label}</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes modal-enter { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-modal-enter { animation: modal-enter 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

