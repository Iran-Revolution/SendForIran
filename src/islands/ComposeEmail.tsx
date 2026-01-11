import { useState, useEffect, useMemo } from 'preact/hooks';
import type { Recipient, Template } from '../types';
import EmailPreview from './EmailPreview';

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

  // Read from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const recipientsParam = urlParams.get('recipients') || '';
      const templateParam = urlParams.get('template') || '';
      
      setRecipientIds(recipientsParam.split(',').filter(Boolean));
      setTemplateId(templateParam);
      setIsLoading(false);
    }
  }, []);

  // Filter recipients and find template
  const selectedRecipients = useMemo(() => {
    if (recipientIds.length === 0) return [];
    return allRecipients.filter((r) => recipientIds.includes(r.id));
  }, [allRecipients, recipientIds]);

  const selectedTemplate = useMemo(() => {
    if (templateId) {
      return allTemplates.find((t) => t.id === templateId);
    }
    return allTemplates[0];
  }, [allTemplates, templateId]);

  if (isLoading) {
    return (
      <div class="flex items-center justify-center py-xl">
        <div class="animate-pulse text-text/50">Loading...</div>
      </div>
    );
  }

  if (selectedRecipients.length === 0 || !selectedTemplate) {
    return (
      <div class="text-center py-xl">
        <p class="text-text/50 mb-md">
          {selectedRecipients.length === 0 ? labels.noRecipients : labels.noTemplate}
        </p>
        <a 
          href={startOverUrl}
          class="inline-flex items-center justify-center px-lg py-sm min-h-[44px] rounded-sm bg-surface border border-white/20 text-text hover:bg-white/10 transition-colors"
        >
          {labels.startOver}
        </a>
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

