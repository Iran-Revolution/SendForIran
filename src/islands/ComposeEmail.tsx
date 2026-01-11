import { useState, useEffect, useMemo } from 'preact/hooks';
import type { Recipient, Template } from '../types';
import EmailPreview from './EmailPreview';
import { loadWizardState, clearWizardState } from '../lib/wizard-state';

interface Props {
  allRecipients: Recipient[];
  allTemplates: Template[];
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
    noRecipients: string;
    noTemplate: string;
    startOver: string;
  };
  startOverUrl: string;
}

export default function ComposeEmail({ allRecipients, allTemplates, senderCountry, labels, startOverUrl }: Props) {
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = loadWizardState();
      console.log('[ComposeEmail] Loaded wizard state:', state);
      console.log('[ComposeEmail] recipientIds:', state.recipientIds);
      console.log('[ComposeEmail] templateId:', state.templateId);
      console.log('[ComposeEmail] allRecipients passed:', allRecipients.length);
      console.log('[ComposeEmail] allTemplates passed:', allTemplates.length);
      setRecipientIds(state.recipientIds);
      setTemplateId(state.templateId || '');
      setIsLoading(false);
    }
  }, []);

  // Filter recipients and find template
  const selectedRecipients = useMemo(() => {
    if (recipientIds.length === 0) return [];
    console.log('[ComposeEmail] Filtering - recipientIds:', recipientIds);
    console.log('[ComposeEmail] Filtering - allRecipients IDs:', allRecipients.map(r => r.id));
    const filtered = allRecipients.filter((r) => recipientIds.includes(r.id));
    console.log('[ComposeEmail] Filtered result:', filtered.length, 'recipients');
    return filtered;
  }, [allRecipients, recipientIds]);

  const selectedTemplate = useMemo(() => {
    console.log('[ComposeEmail] Template selection - templateId:', templateId);
    console.log('[ComposeEmail] Template selection - allTemplates IDs:', allTemplates.map(t => t.id));
    if (templateId) {
      const found = allTemplates.find((t) => t.id === templateId);
      console.log('[ComposeEmail] Found template:', found?.id);
      return found;
    }
    console.log('[ComposeEmail] Using first template:', allTemplates[0]?.id);
    return allTemplates[0];
  }, [allTemplates, templateId]);

  if (isLoading) {
    return (
      <div class="flex items-center justify-center py-xl">
        <div class="animate-pulse text-text/50">Loading...</div>
      </div>
    );
  }

  const handleStartOver = () => {
    clearWizardState();
    window.location.href = startOverUrl;
  };

  console.log('[ComposeEmail] Pre-render check - selectedRecipients:', selectedRecipients.length);
  console.log('[ComposeEmail] Pre-render check - selectedTemplate:', selectedTemplate?.id);
  console.log('[ComposeEmail] Pre-render check - isLoading:', isLoading);

  if (selectedRecipients.length === 0 || !selectedTemplate) {
    console.log('[ComposeEmail] Rendering empty state - reason:',
      selectedRecipients.length === 0 ? 'no recipients' : 'no template');
    return (
      <div class="text-center py-xl">
        <p class="text-text/50 mb-md">
          {selectedRecipients.length === 0 ? labels.noRecipients : labels.noTemplate}
        </p>
        <button
          type="button"
          onClick={handleStartOver}
          class="inline-flex items-center justify-center px-lg py-sm min-h-[44px] rounded-sm bg-surface border border-white/20 text-text hover:bg-white/10 transition-colors"
        >
          {labels.startOver}
        </button>
      </div>
    );
  }

  return (
    <EmailPreview
      recipients={selectedRecipients}
      template={selectedTemplate}
      senderCountry={senderCountry}
      labels={labels}
    />
  );
}

