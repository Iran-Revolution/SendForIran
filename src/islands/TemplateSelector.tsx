import { useState, useEffect } from 'preact/hooks';
import type { Template } from '../types';

interface Props {
  templates: Template[];
  composeUrl: string;
  recipientIds?: string; // Optional - we'll read from URL if not provided
  labels: {
    preview: string;
    useTemplate: string;
    sources: string;
    variations: string;
    urgent: string;
    awareness: string;
    action: string;
    sanctions: string;
    noRecipientsWarning?: string;
  };
}

const typeBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-urgent/20', text: 'text-urgent', border: 'border-urgent/30' },
  awareness: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
  action: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  sanctions: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export default function TemplateSelector({ templates, composeUrl, recipientIds: initialRecipientIds, labels }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [recipientIds, setRecipientIds] = useState<string>(initialRecipientIds || '');
  const previewTemplate = templates.find((t) => t.id === previewId);

  // Read recipients from URL on mount (client-side) since static builds don't have query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const recipientsFromUrl = urlParams.get('recipients') || '';
      if (recipientsFromUrl) {
        setRecipientIds(recipientsFromUrl);
      }
    }
  }, []);

  // Check if we have recipients
  const hasRecipients = recipientIds && recipientIds.trim().length > 0;

  const getTypeLabel = (type: string) => {
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div class="space-y-md">
      {/* Warning if no recipients */}
      {!hasRecipients && (
        <div class="p-md rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 flex-shrink-0 mt-[2px]" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium text-amber-400">
              {labels.noRecipientsWarning || 'No recipients selected'}
            </p>
            <p class="text-sm text-text/60 mt-xs">
              Please go back and select at least one recipient before choosing a template.
            </p>
          </div>
        </div>
      )}

      {/* Template grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
        {templates.map((template) => {
          const style = typeBadgeStyles[template.type] || typeBadgeStyles.awareness;
          const variationCount = template.variations.length + 1;
          const finalUrl = hasRecipients
            ? `${composeUrl}?recipients=${recipientIds}&template=${template.id}`
            : undefined;

          return (
            <div
              key={template.id}
              class="p-md rounded-md bg-surface border border-white/10 hover:border-primary/50 transition-all duration-200 group"
            >
              {/* Header badges */}
              <div class="flex items-center gap-sm flex-wrap mb-sm">
                <span class={`text-xs font-medium px-sm py-[2px] rounded-xs border ${style.bg} ${style.text} ${style.border}`}>
                  {template.type === 'urgent' && <span class="animate-pulse me-[4px]">●</span>}
                  {getTypeLabel(template.type)}
                </span>
                <span class="text-xs text-text/50">
                  {template.sources.length} {labels.sources}
                </span>
                <span class="text-xs text-text/50">
                  {variationCount} {labels.variations}
                </span>
              </div>

              {/* Subject */}
              <h3 class="font-semibold text-text group-hover:text-primary transition-colors mb-sm line-clamp-2">
                {template.subject}
              </h3>

              {/* Body preview */}
              <p class="text-sm text-text/60 mb-md line-clamp-3">
                {template.body.slice(0, 150)}...
              </p>

              {/* Actions */}
              <div class="flex gap-sm">
                <button
                  type="button"
                  onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                  class="flex-1 px-md py-sm min-h-[44px] rounded-sm bg-white/5 border border-white/20 text-text/70 text-sm hover:bg-white/10 transition-colors"
                >
                  {labels.preview}
                </button>
                {finalUrl ? (
                  <a
                    href={finalUrl}
                    class="flex-1 px-md py-sm min-h-[44px] rounded-sm bg-primary text-white text-sm text-center font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                  >
                    {labels.useTemplate}
                  </a>
                ) : (
                  <span
                    class="flex-1 px-md py-sm min-h-[44px] rounded-sm bg-white/10 text-text/40 text-sm text-center font-medium cursor-not-allowed inline-flex items-center justify-center border border-white/10"
                    title="Select recipients first"
                  >
                    {labels.useTemplate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/70" onClick={() => setPreviewId(null)}>
          <div
            class="bg-surface rounded-md border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex items-start justify-between mb-md">
              <h2 class="text-xl font-bold text-text">{previewTemplate.subject}</h2>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                class="p-xs min-h-[44px] min-w-[44px] text-text/50 hover:text-text transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <pre class="text-sm text-text/80 whitespace-pre-wrap font-sans mb-md">{previewTemplate.body}</pre>
            <div class="border-t border-white/10 pt-md">
              <h3 class="text-sm font-semibold text-text/60 mb-sm">{labels.sources}</h3>
              <ul class="space-y-xs">
                {previewTemplate.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">
                      {source.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

