/**
 * PackageDice - Interactive dice roller for random package selection
 * Features 3D dice animation and fair randomization
 */
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { EmailPackage } from '../types';
import type { SupportedLang } from '../lib/i18n';
import { 
  selectRandomPackage, 
  getCountryDiceHistory, 
  recordDiceRoll 
} from '../lib/packages';
import { getLocalizedValue, getLocalizedKeywords } from '../types/package';
import type { CountryCode } from '../types/recipient';

interface Props {
  packages: EmailPackage[];
  country: CountryCode;
  lang?: SupportedLang;
  labels: {
    rollDice: string;
    rolling: string;
    preview: string;
    sendNow: string;
    recipients: string;
  };
  onPreview?: (pkg: EmailPackage) => void;
  onSend?: (pkg: EmailPackage) => void;
}

export default function PackageDice({
  packages,
  country,
  lang = 'en',
  labels,
  onPreview,
  onSend
}: Props) {
  const [currentPackage, setCurrentPackage] = useState<EmailPackage | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Initial random selection on mount
  useEffect(() => {
    if (packages.length > 0 && !currentPackage) {
      const history = getCountryDiceHistory(country);
      const selected = selectRandomPackage(packages, history.history);
      if (selected) {
        setCurrentPackage(selected);
        setShowResult(true);
      }
    }
  }, [packages, country]);

  const rollDice = useCallback(() => {
    if (isRolling || packages.length === 0) return;

    setIsRolling(true);
    setShowResult(false);

    // Animate for 1.5 seconds
    setTimeout(() => {
      const history = getCountryDiceHistory(country);
      const selected = selectRandomPackage(packages, history.history);
      
      if (selected) {
        recordDiceRoll(country, selected.id);
        setCurrentPackage(selected);
      }
      
      setIsRolling(false);
      setShowResult(true);
    }, 1500);
  }, [packages, country, isRolling]);

  if (!currentPackage && !isRolling) {
    return (
      <div class="text-center py-xl">
        <p class="text-text/50">Loading packages...</p>
      </div>
    );
  }

  return (
    <div class="flex flex-col items-center gap-lg">
      {/* Dice Button */}
      <button
        onClick={rollDice}
        disabled={isRolling}
        class={`
          relative w-24 h-24 text-5xl
          bg-gradient-to-br from-surface to-surface/50
          border-2 border-white/20 rounded-xl
          shadow-lg hover:shadow-xl
          transition-all duration-300
          ${isRolling ? 'animate-dice-roll cursor-wait' : 'hover:scale-110 hover:border-primary/50 cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg
        `}
        aria-label={labels.rollDice}
      >
        🎲
      </button>

      <p class="text-text/50 text-sm">
        {isRolling ? labels.rolling : labels.rollDice}
      </p>

      {/* Package Result Card */}
      {showResult && currentPackage && (
        <div
          class={`
            w-full max-w-lg
            bg-surface/90 backdrop-blur-md
            border border-white/10 rounded-xl
            overflow-hidden
            animate-package-reveal
          `}
        >
          <PackageResultCard 
            package={currentPackage}
            lang={lang}
            labels={labels}
            onPreview={onPreview}
            onSend={onSend}
          />
        </div>
      )}

      <style>{`
        @keyframes dice-roll {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.9); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-dice-roll {
          animation: dice-roll 0.5s ease-in-out infinite;
        }
        @keyframes package-reveal {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-package-reveal {
          animation: package-reveal 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Internal component for the result card
function PackageResultCard({
  package: pkg,
  lang,
  labels,
  onPreview,
  onSend
}: {
  package: EmailPackage;
  lang: SupportedLang;
  labels: Props['labels'];
  onPreview?: Props['onPreview'];
  onSend?: Props['onSend'];
}) {
  const title = getLocalizedValue(pkg.display.title, lang);
  const description = getLocalizedValue(pkg.display.description, lang);
  const keywords = getLocalizedKeywords(pkg.display.keywords, lang);

  return (
    <div class="p-lg">
      {/* Header */}
      <div class="flex items-start gap-sm mb-md">
        <span class="text-3xl">{pkg.display.icon}</span>
        <div class="flex-1">
          <div class="flex items-center gap-sm mb-xs">
            <span class="text-xs font-medium uppercase tracking-wider text-primary">
              {pkg.meta.type}
            </span>
            {pkg.ui.badge && (
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-urgent/20 text-urgent rounded-full">
                {pkg.ui.badge}
              </span>
            )}
          </div>
          <h3 class="text-xl font-bold text-text">{title}</h3>
        </div>
      </div>

      {/* Description */}
      <p class="text-text/70 mb-md leading-relaxed">{description}</p>

      {/* Keywords */}
      <div class="flex flex-wrap gap-1 mb-md">
        {keywords.map((kw) => (
          <span class="px-2 py-0.5 text-xs bg-white/5 text-text/50 rounded-full border border-white/10">
            #{kw}
          </span>
        ))}
      </div>

      {/* Recipients info */}
      <div class="flex items-center gap-sm mb-lg text-sm text-text/50">
        <span>👥</span>
        <span>{pkg.recipients.ids.length} {labels.recipients}</span>
        <span class="text-text/20">•</span>
        {pkg.recipients.categories.map((cat) => (
          <span>{cat === 'journalist' ? '📰' : cat === 'media' ? '📺' : cat === 'government' ? '🏛️' : '🗳️'}</span>
        ))}
      </div>

      {/* Actions */}
      <div class="flex gap-sm">
        <button
          onClick={() => onPreview?.(pkg)}
          class="flex-1 py-sm px-md text-sm font-medium text-text/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          👁️ {labels.preview}
        </button>
        <button
          onClick={() => onSend?.(pkg)}
          class="flex-1 py-sm px-md text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          ✉️ {labels.sendNow}
        </button>
      </div>
    </div>
  );
}

