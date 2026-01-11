/**
 * Type definitions index for SendForIran
 */

export type {
  Template,
  TemplateFile,
  TemplateType,
  TemplateVariation,
  Source,
  RecipientType
} from './template';

export type {
  Recipient,
  RecipientFile,
  RecipientCategory,
  Priority,
  CountryCode
} from './recipient';

export type {
  WizardStep,
  CategoryInfo,
  WizardState,
  WizardStepProps
} from './wizard';

export { categoryMeta, allCategories } from './wizard';

// Email Package types (new system)
export type {
  EmailPackage,
  PackageFile,
  PackageMeta,
  PackageDisplay,
  PackageTemplate,
  PackageRecipients,
  PackageUI,
  LocalizedString,
  LocalizedKeywords,
  PackagePriority,
  PackageBadge,
  PackageColor
} from './package';

export { getLocalizedValue, getLocalizedKeywords } from './package';

