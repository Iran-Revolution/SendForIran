/**
 * PackageSelector - Main interactive component for package selection
 * Supports both Grid (Option A) and Dice (Option B) display modes
 */
import { useState, useCallback, useMemo } from 'preact/hooks';
import type { EmailPackage, Recipient } from '../types';
import type { CountryCode } from '../types/recipient';
import type { SupportedLang } from '../lib/i18n';
import { getLocalizedValue } from '../types/package';
import { resolveRecipients } from '../lib/packages';
import PackageDice from './PackageDice';
import PackagePreviewModal from './PackagePreviewModal';
import EmailServiceModal from './EmailServiceModal';

type DisplayMode = 'grid' | 'dice';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

interface Props {
  packages: EmailPackage[];
  recipients: Recipient[];
  country: CountryCode;
  lang?: SupportedLang;
  mode?: DisplayMode;
  labels: {
    preview: string;
    sendNow: string;
    sendToAll: string;
    recipients: string;
    rollDice: string;
    rolling: string;
    close: string;
    whyThisPackage: string;
    sources: string;
    emailPreview: string;
    viewAsGrid: string;
    viewAsDice: string;
  };
  emailServiceLabels: {
    chooseService: string;
    gmail: string;
    outlook: string;
    yahoo: string;
    defaultEmail: string;
    copyToClipboard: string;
    copied: string;
    sendVia: string;
  };
}

export default function PackageSelector({
  packages,
  recipients,
  country,
  lang = 'en',
  mode: initialMode = 'grid',
  labels,
  emailServiceLabels
}: Props) {
  const [mode, setMode] = useState<DisplayMode>(initialMode);
  const [selectedPackage, setSelectedPackage] = useState<EmailPackage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEmailServiceOpen, setIsEmailServiceOpen] = useState(false);
  const [emailData, setEmailData] = useState<EmailData | null>(null);

  // Get recipients for selected package
  const packageRecipients = useMemo(() => {
    if (!selectedPackage) return [];
    return resolveRecipients(selectedPackage, recipients);
  }, [selectedPackage, recipients]);

  const handlePreview = useCallback((pkg: EmailPackage) => {
    setSelectedPackage(pkg);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleSend = useCallback((pkg: EmailPackage) => {
    const pkgRecipients = resolveRecipients(pkg, recipients);
    if (pkgRecipients.length === 0) return;

    // Collect all emails
    const emails = pkgRecipients.map(r => r.email).join(',');

    // Set email data and open service selector
    // Note: Package templates are pre-filled with actual values, no placeholders
    setEmailData({
      to: emails,
      subject: pkg.template.subject,
      body: pkg.template.body
    });
    setIsEmailServiceOpen(true);
  }, [recipients]);

  const handleCloseEmailService = useCallback(() => {
    setIsEmailServiceOpen(false);
    setEmailData(null);
  }, []);

  return (
    <div>
      {/* Mode Toggle */}
      <div class="flex justify-center gap-sm mb-lg">
        <button
          onClick={() => setMode('grid')}
          class={`
            px-md py-sm text-sm font-medium rounded-lg transition-colors
            ${mode === 'grid' 
              ? 'bg-primary text-white' 
              : 'bg-white/5 text-text/50 hover:bg-white/10 hover:text-text'}
          `}
        >
          {labels.viewAsGrid}
        </button>
        <button
          onClick={() => setMode('dice')}
          class={`
            px-md py-sm text-sm font-medium rounded-lg transition-colors
            ${mode === 'dice' 
              ? 'bg-primary text-white' 
              : 'bg-white/5 text-text/50 hover:bg-white/10 hover:text-text'}
          `}
        >
          🎲 {labels.viewAsDice}
        </button>
      </div>

      {/* Grid Mode */}
      {mode === 'grid' && (
        <div class="grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <GridPackageCard
              key={pkg.id}
              package={pkg}
              lang={lang}
              labels={labels}
              onPreview={() => handlePreview(pkg)}
              onSend={() => handleSend(pkg)}
            />
          ))}
        </div>
      )}

      {/* Dice Mode */}
      {mode === 'dice' && (
        <PackageDice
          packages={packages}
          country={country}
          labels={{
            rollDice: labels.rollDice,
            rolling: labels.rolling,
            preview: labels.preview,
            sendNow: labels.sendNow,
            recipients: labels.recipients
          }}
          onPreview={handlePreview}
          onSend={handleSend}
        />
      )}

      {/* Preview Modal */}
      <PackagePreviewModal
        package={selectedPackage}
        recipients={packageRecipients}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onSend={handleSend}
        labels={labels}
      />

      {/* Email Service Selector Modal */}
      <EmailServiceModal
        isOpen={isEmailServiceOpen}
        emailData={emailData}
        onClose={handleCloseEmailService}
        labels={{
          ...emailServiceLabels,
          close: labels.close
        }}
      />
    </div>
  );
}

// Grid card component (simplified for island)
function GridPackageCard({
  package: pkg,
  lang,
  labels,
  onPreview,
  onSend
}: {
  package: EmailPackage;
  lang: SupportedLang;
  labels: Props['labels'];
  onPreview: () => void;
  onSend: () => void;
}) {
  const title = getLocalizedValue(pkg.display.title, lang);
  const description = getLocalizedValue(pkg.display.description, lang);
  const recipientCount = pkg.recipients.ids.length;

  return (
    <article class={`
      group relative flex flex-col
      bg-surface/80 backdrop-blur-sm
      border border-primary/30 rounded-lg overflow-hidden
      transition-all duration-300 ease-out
      hover:transform hover:-translate-y-1 hover:scale-[1.02]
      hover:shadow-2xl hover:shadow-primary/20
    `}>
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div class="relative p-md flex flex-col flex-1">
        <div class="flex items-start justify-between gap-sm mb-sm">
          <div class="flex items-center gap-sm">
            <span class="text-2xl">✉️</span>
            <span class="text-xs font-medium uppercase tracking-wider text-primary">
              Email
            </span>
          </div>
        </div>

        <h3 class="text-lg font-bold text-text mb-xs">{title}</h3>
        <p class="text-sm text-text/60 mb-md line-clamp-2 flex-1">{description}</p>

        <div class="flex items-center justify-between pt-sm border-t border-white/10">
          <div class="flex items-center gap-xs text-sm text-text/50">
            <span>👥</span>
            <span>{recipientCount} {labels.recipients}</span>
          </div>
        </div>
      </div>

      <div class="flex border-t border-white/10">
        <button
          onClick={onPreview}
          class="flex-1 py-sm text-sm font-medium text-text/70 hover:text-text hover:bg-white/5 transition-colors"
        >
          👁️ {labels.preview}
        </button>
        <div class="w-px bg-white/10" />
        <button
          onClick={onSend}
          class="flex-1 py-sm text-sm font-medium text-primary hover:bg-white/5 transition-colors"
        >
          ✉️ {labels.sendNow}
        </button>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </article>
  );
}

