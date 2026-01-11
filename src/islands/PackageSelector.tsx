/**
 * PackageSelector - Main interactive component for package selection
 * Supports both Grid (Option A) and Dice (Option B) display modes
 */
import { useState, useCallback, useMemo } from 'preact/hooks';
import type { EmailPackage, Recipient } from '../types';
import type { SupportedLang } from '../lib/i18n';
import type { CountryCode } from '../types/recipient';
import { getLocalizedValue, getLocalizedKeywords } from '../types/package';
import { resolveRecipients } from '../lib/packages';
import { generateMailto, fillPlaceholders } from '../lib/mailto';
import PackageDice from './PackageDice';
import PackagePreviewModal from './PackagePreviewModal';

type DisplayMode = 'grid' | 'dice';

interface Props {
  packages: EmailPackage[];
  recipients: Recipient[];
  country: CountryCode;
  senderCountry: string;
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
}

export default function PackageSelector({
  packages,
  recipients,
  country,
  senderCountry,
  lang = 'en',
  mode: initialMode = 'grid',
  labels
}: Props) {
  const [mode, setMode] = useState<DisplayMode>(initialMode);
  const [selectedPackage, setSelectedPackage] = useState<EmailPackage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

    // Use first recipient for single send, or compose for multiple
    const firstRecipient = pkgRecipients[0];
    const placeholders = {
      recipientName: firstRecipient.name,
      senderCountry
    };

    const filledSubject = fillPlaceholders(pkg.template.subject, placeholders);
    const filledBody = fillPlaceholders(pkg.template.body, placeholders);

    // For multiple recipients, use BCC approach or open compose for first
    const emails = pkgRecipients.map(r => r.email);
    const mailto = generateMailto({
      to: emails.join(','),
      subject: filledSubject,
      body: filledBody
    });

    window.location.href = mailto;
  }, [recipients, senderCountry]);

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
          lang={lang}
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
        lang={lang}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onSend={handleSend}
        labels={labels}
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
  const keywords = getLocalizedKeywords(pkg.display.keywords, lang);
  const recipientCount = pkg.recipients.ids.length;

  const colorClasses = {
    red: 'border-red-500/30 hover:shadow-red-500/20',
    blue: 'border-blue-500/30 hover:shadow-blue-500/20',
    green: 'border-green-500/30 hover:shadow-green-500/20',
    purple: 'border-purple-500/30 hover:shadow-purple-500/20',
    amber: 'border-amber-500/30 hover:shadow-amber-500/20',
    emerald: 'border-emerald-500/30 hover:shadow-emerald-500/20',
  };

  return (
    <article class={`
      group relative flex flex-col
      bg-surface/80 backdrop-blur-sm
      border rounded-lg overflow-hidden
      transition-all duration-300 ease-out
      hover:transform hover:-translate-y-1 hover:scale-[1.02]
      hover:shadow-2xl hover:shadow-black/30
      ${colorClasses[pkg.ui.color] || colorClasses.blue}
    `}>
      <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div class="relative p-md flex flex-col flex-1">
        <div class="flex items-start justify-between gap-sm mb-sm">
          <div class="flex items-center gap-sm">
            <span class="text-2xl">{pkg.display.icon}</span>
            <span class="text-xs font-medium uppercase tracking-wider text-primary">
              {pkg.meta.type}
            </span>
          </div>
          {pkg.ui.badge && (
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-urgent/20 text-urgent rounded-full">
              {pkg.ui.badge}
            </span>
          )}
        </div>
        
        <h3 class="text-lg font-bold text-text mb-xs">{title}</h3>
        <p class="text-sm text-text/60 mb-md line-clamp-2 flex-1">{description}</p>
        
        <div class="flex flex-wrap gap-1 mb-md">
          {keywords.slice(0, 3).map((kw) => (
            <span class="px-2 py-0.5 text-[10px] bg-white/5 text-text/50 rounded-full border border-white/10">
              #{kw}
            </span>
          ))}
        </div>
        
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

