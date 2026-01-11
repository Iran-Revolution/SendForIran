/**
 * PackagePreviewModal - Full preview modal for email packages
 * Shows template content, recipients, and send action
 */
import { useEffect } from 'preact/hooks';
import type { EmailPackage, Recipient } from '../types';
import type { SupportedLang } from '../lib/i18n';
import { getLocalizedValue } from '../types/package';

interface Props {
  package: EmailPackage | null;
  recipients: Recipient[];
  isOpen: boolean;
  onClose: () => void;
  onSend: (pkg: EmailPackage) => void;
  lang?: SupportedLang;
  labels: {
    preview: string;
    sendToAll: string;
    close: string;
    recipients: string;
    whyThisPackage: string;
    sources: string;
    emailPreview: string;
  };
}

export default function PackagePreviewModal({
  package: pkg,
  recipients,
  isOpen,
  onClose,
  onSend,
  lang = 'en',
  labels
}: Props) {
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

  if (!isOpen || !pkg) return null;

  const title = getLocalizedValue(pkg.display.title, lang);
  const description = getLocalizedValue(pkg.display.description, lang);

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-surface border border-white/10 rounded-xl shadow-2xl animate-modal-enter">
        {/* Header */}
        <div class="sticky top-0 flex items-center justify-between p-md bg-surface/95 backdrop-blur border-b border-white/10">
          <div class="flex items-center gap-sm">
            <span class="text-2xl">✉️</span>
            <h2 id="modal-title" class="text-xl font-bold text-text">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            class="p-sm text-text/50 hover:text-text hover:bg-white/5 rounded-lg transition-colors"
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div class="p-lg space-y-lg">
          {/* Description */}
          <section>
            <p class="text-text/70 leading-relaxed">{description}</p>
          </section>

          {/* Recipients */}
          <section>
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wider mb-sm">
              {labels.recipients} ({recipients.length})
            </h3>
            <div class="space-y-xs">
              {recipients.map((r) => (
                <div key={r.id} class="flex items-center gap-sm p-sm bg-white/5 rounded-lg">
                  <span class="text-lg">
                    {r.type === 'journalist' ? '📰' : r.type === 'media' ? '📺' : r.type === 'government' ? '🏛️' : '🗳️'}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-text font-medium truncate">{r.name}</p>
                    <p class="text-text/50 text-sm truncate">{r.organization}</p>
                  </div>
                  <span class="text-xs px-2 py-0.5 bg-white/10 text-text/50 rounded-full">
                    {r.type}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Email Preview */}
          <section>
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wider mb-sm">
              {labels.emailPreview}
            </h3>
            <div class="bg-white/5 border border-white/10 rounded-lg p-md">
              <p class="text-text/50 text-sm mb-xs">Subject:</p>
              <p class="text-text font-medium mb-md">{pkg.template.subject}</p>
              <p class="text-text/50 text-sm mb-xs">Message:</p>
              <pre class="text-text/80 text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-auto">
                {pkg.template.body}
              </pre>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div class="sticky bottom-0 p-md bg-surface/95 backdrop-blur border-t border-white/10">
          <button
            onClick={() => onSend(pkg)}
            class="w-full py-md px-lg text-lg font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            ✉️ {labels.sendToAll} ({recipients.length})
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-enter {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

