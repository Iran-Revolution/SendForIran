import { useState, useMemo } from 'preact/hooks';
import type { Recipient, RecipientCategory } from '../types';

interface Props {
  recipients: Recipient[];
  nextUrl: string;
  labels: {
    selectAll: string;
    clearAll: string;
    selected: string;
    search: string;
    next: string;
    noResults: string;
    categoryLabels?: Record<RecipientCategory, string>;
  };
  showCategoryBadges?: boolean;
}

/** Priority badge colors and labels */
const priorityColors: Record<number, string> = {
  1: 'bg-urgent/20 text-urgent border-urgent/30',
  2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  3: 'bg-white/10 text-text/60 border-white/20',
};

const priorityLabels: Record<number, string> = {
  1: '★ High',
  2: '◆ Medium',
  3: '○ Normal',
};

/** Category badge colors */
const categoryColors: Record<RecipientCategory, string> = {
  journalist: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  media: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  government: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  mp: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function RecipientSelector({ recipients, nextUrl, labels, showCategoryBadges = false }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  /** Filter recipients by search */
  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q)
    );
  }, [recipients, search]);

  const toggleRecipient = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((r) => r.id)));
  const clearAll = () => setSelected(new Set());

  const selectedRecipients = recipients.filter((r) => selected.has(r.id));
  const finalUrl = `${nextUrl}?recipients=${Array.from(selected).join(',')}`;

  return (
    <div class="space-y-md">
      {/* Toolbar */}
      <div class="flex flex-col sm:flex-row gap-sm items-stretch sm:items-center justify-between">
        {/* Search */}
        <div class="relative flex-1 max-w-md">
          <input
            type="search"
            placeholder={labels.search}
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            class="w-full min-h-[44px] px-md py-sm ps-10 rounded-sm bg-surface border border-white/20 text-text placeholder-text/40 focus:border-primary focus:outline-none transition-colors"
            aria-label={labels.search}
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text/40" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        {/* Bulk actions */}
        <div class="flex gap-sm">
          <button
            type="button"
            onClick={selectAll}
            class="px-md py-sm min-h-[44px] rounded-sm bg-surface border border-white/20 text-text text-sm hover:bg-white/10 transition-colors"
          >
            {labels.selectAll}
          </button>
          <button
            type="button"
            onClick={clearAll}
            class="px-md py-sm min-h-[44px] rounded-sm bg-surface border border-white/20 text-text/70 text-sm hover:bg-white/10 transition-colors"
          >
            {labels.clearAll}
          </button>
        </div>
      </div>

      {/* Selected count and continue button */}
      <div class={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-sm p-md rounded-md border transition-all ${
        selected.size > 0
          ? 'bg-primary/10 border-primary/30'
          : 'bg-surface border-white/10'
      }`}>
        <div>
          <p class={`font-medium ${selected.size > 0 ? 'text-primary' : 'text-text/50'}`}>
            {selected.size} {labels.selected}
          </p>
          {selected.size === 0 && (
            <p class="text-sm text-text/40 mt-xs">
              {labels.selectAtLeastOne || 'Select at least one recipient to continue'}
            </p>
          )}
        </div>
        {selected.size > 0 ? (
          <a
            href={finalUrl}
            class="inline-flex items-center justify-center gap-sm px-6 py-3 min-h-[48px] min-w-[160px] rounded-md font-medium bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            {labels.next}
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span
            class="inline-flex items-center justify-center gap-sm px-6 py-3 min-h-[48px] min-w-[160px] rounded-md font-medium bg-white/10 text-text/40 cursor-not-allowed border border-white/10"
            aria-disabled="true"
          >
            {labels.next}
            <span aria-hidden="true">→</span>
          </span>
        )}
      </div>

      {/* Recipient list */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-sm max-h-[500px] overflow-y-auto p-xs">
        {filtered.length === 0 && (
          <p class="col-span-full text-center py-lg text-text/50">{labels.noResults}</p>
        )}
        {filtered.map((recipient) => {
          const isSelected = selected.has(recipient.id);
          return (
            <button
              key={recipient.id}
              type="button"
              onClick={() => toggleRecipient(recipient.id)}
              class={`
                text-start p-md rounded-md border transition-all duration-200 min-h-[44px]
                ${isSelected
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                  : 'bg-surface border-white/10 hover:border-white/30 hover:bg-white/5'}
              `}
              aria-pressed={isSelected}
            >
              <div class="flex items-start gap-sm">
                <div class={`
                  w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 mt-[2px]
                  ${isSelected ? 'bg-primary border-primary' : 'border-white/30'}
                `}>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  )}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-xs flex-wrap mb-[2px]">
                    <p class="font-medium text-text truncate">{recipient.name}</p>
                    {showCategoryBadges && labels.categoryLabels && (
                      <span class={`text-[10px] px-xs py-[1px] rounded-xs border ${categoryColors[recipient.type]}`}>
                        {labels.categoryLabels[recipient.type]}
                      </span>
                    )}
                  </div>
                  <p class="text-sm text-text/60 truncate">{recipient.title}</p>
                  <p class="text-xs text-text/40 truncate">{recipient.organization}</p>
                </div>
                <span class={`text-[10px] px-sm py-[2px] rounded-xs border whitespace-nowrap ${priorityColors[recipient.priority]}`}>
                  {priorityLabels[recipient.priority] || `P${recipient.priority}`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

