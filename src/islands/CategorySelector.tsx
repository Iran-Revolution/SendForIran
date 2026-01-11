import { useState } from 'preact/hooks';
import type { RecipientCategory } from '../types';

interface CategoryData {
  id: RecipientCategory;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

interface Props {
  categories: CategoryData[];
  country: string;
  baseUrl: string;
  labels: {
    selectCategories: string;
    categoriesSelected: string;
    continue: string;
    selectAtLeastOne: string;
  };
}

// Canonical order for categories - must match allCategories in data.ts
const CATEGORY_ORDER: RecipientCategory[] = ['journalist', 'media', 'government', 'mp'];

const categoryColorClasses: Record<RecipientCategory, string> = {
  journalist: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  media: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  government: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  mp: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
};

const selectedColorClasses: Record<RecipientCategory, string> = {
  journalist: 'ring-blue-400 border-blue-400/50',
  media: 'ring-purple-400 border-purple-400/50',
  government: 'ring-amber-400 border-amber-400/50',
  mp: 'ring-emerald-400 border-emerald-400/50',
};

export default function CategorySelector({ categories, country, baseUrl, labels }: Props) {
  const [selected, setSelected] = useState<Set<RecipientCategory>>(new Set());

  const toggleCategory = (id: RecipientCategory) => {
    const cat = categories.find(c => c.id === id);
    if (cat && cat.count === 0) return; // Can't select empty categories

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalRecipients = categories
    .filter(c => selected.has(c.id))
    .reduce((sum, c) => sum + c.count, 0);

  // Sort categories in canonical order to ensure consistent URLs
  const selectedCategories = CATEGORY_ORDER.filter(cat => selected.has(cat));
  const continueUrl = selectedCategories.length > 0
    ? `${baseUrl}/${country}/${selectedCategories.join(',')}`
    : undefined;

  return (
    <div class="space-y-lg">
      {/* Category Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
        {categories.map((category) => {
          const isSelected = selected.has(category.id);
          const isDisabled = category.count === 0;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              disabled={isDisabled}
              class={`
                relative overflow-hidden text-start p-lg rounded-md border transition-all duration-300
                bg-gradient-to-br ${categoryColorClasses[category.id]}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10'}
                ${isSelected ? `ring-2 ${selectedColorClasses[category.id]}` : ''}
              `}
              aria-pressed={isSelected}
            >
              {/* Checkbox indicator */}
              <div class={`
                absolute top-md end-md w-6 h-6 rounded-sm border-2 flex items-center justify-center
                ${isSelected ? 'bg-primary border-primary' : 'border-white/30 bg-white/5'}
              `}>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                )}
              </div>

              <div class="flex items-start gap-md pe-8">
                <span class="text-4xl flex-shrink-0" role="img" aria-hidden="true">
                  {category.icon}
                </span>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-text mb-xs">
                    {category.label}
                  </h3>
                  <p class="text-sm text-text/60 mb-sm line-clamp-2">
                    {category.description}
                  </p>
                  <span class={`
                    inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-xs font-medium
                    ${category.count > 0 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text/40'}
                  `}>
                    <span class="font-bold">{category.count}</span>
                    <span>recipients</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection summary and continue button */}
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-md p-md bg-surface rounded-md border border-white/10">
        <div>
          <p class="text-text font-medium">
            {selected.size} {labels.categoriesSelected}
          </p>
          <p class="text-sm text-text/60">
            {totalRecipients} total recipients
          </p>
        </div>
        
        <a
          href={continueUrl}
          class={`
            inline-flex items-center justify-center gap-sm px-6 py-3 min-h-[48px] min-w-[200px] rounded-md font-medium transition-all text-sm sm:text-base
            ${continueUrl
              ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-white/10 text-text/50 cursor-not-allowed pointer-events-none border border-white/10'}
          `}
          aria-disabled={!continueUrl}
        >
          {continueUrl ? labels.continue : labels.selectAtLeastOne}
          {continueUrl && <span aria-hidden="true">→</span>}
        </a>
      </div>
    </div>
  );
}

