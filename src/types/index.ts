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

// Email Package types
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

