import { useState, useEffect } from 'preact/hooks';
import type { Template, TemplateVariation } from '../types';

interface Props {
  template: Template;
  onVariationChange?: (subject: string, body: string, index: number) => void;
  shuffleLabel?: string;
  currentLabel?: string;
}

/** Get all variations including the main template */
function getAllVariations(template: Template): TemplateVariation[] {
  return [
    { subject: template.subject, body: template.body },
    ...template.variations,
  ];
}

/** Storage key for persisted variation index */
function getStorageKey(templateId: string): string {
  return `template-shuffle-${templateId}`;
}

export default function TemplateShuffle({
  template,
  onVariationChange,
  shuffleLabel = 'Shuffle Template',
  currentLabel = 'Variation',
}: Props) {
  const variations = getAllVariations(template);
  
  /** Initialize from localStorage or 0 */
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(getStorageKey(template.id));
      const parsed = stored ? parseInt(stored, 10) : 0;
      return parsed >= 0 && parsed < variations.length ? parsed : 0;
    }
    return 0;
  });

  /** Persist index to localStorage */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(template.id), currentIndex.toString());
    }
  }, [currentIndex, template.id]);

  /** Notify parent of variation change */
  useEffect(() => {
    const variation = variations[currentIndex];
    onVariationChange?.(variation.subject, variation.body, currentIndex);
  }, [currentIndex, template.id]);

  /** Shuffle to random variation (or next if only 2 variations) */
  function handleShuffle() {
    if (variations.length <= 2) {
      setCurrentIndex((prev) => (prev + 1) % variations.length);
    } else {
      const newIndex = Math.floor(Math.random() * variations.length);
      setCurrentIndex(newIndex === currentIndex
        ? (newIndex + 1) % variations.length
        : newIndex);
    }
  }

  const currentVariation = variations[currentIndex];

  return (
    <div class="template-shuffle">
      {/* Shuffle Controls */}
      <div class="flex items-center justify-between mb-md">
        <span class="text-sm text-text/60">
          {currentLabel} {currentIndex + 1} / {variations.length}
        </span>
        <div class="flex gap-sm">
          <button
            type="button"
            onClick={handleShuffle}
            class="inline-flex items-center gap-xs px-md py-sm rounded-sm text-sm font-medium transition-all duration-200 bg-surface border border-white/20 text-text hover:bg-white/10 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            {shuffleLabel}
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div class="bg-bg/50 rounded-sm border border-white/10 p-md">
        <div class="mb-sm">
          <label class="text-xs text-text/50 uppercase tracking-wide mb-xs block">
            Subject
          </label>
          <p class="text-text font-medium">
            {currentVariation.subject}
          </p>
        </div>
        <div>
          <label class="text-xs text-text/50 uppercase tracking-wide mb-xs block">
            Preview
          </label>
          <p class="text-sm text-text/80 line-clamp-3">
            {currentVariation.body.slice(0, 200)}...
          </p>
        </div>
      </div>

      {/* Variation Dots */}
      <div class="flex justify-center gap-xs mt-md">
        {variations.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            class={`w-2 h-2 rounded-full transition-all duration-200 min-w-[8px] min-h-[8px] ${
              index === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Select variation ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

