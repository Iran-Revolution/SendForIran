import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const RECIPIENT_TYPES = ['journalist', 'media', 'government', 'mp'] as const;
const COUNTRIES = ['united-states', 'united-kingdom', 'germany', 'france', 'canada'] as const;
const PACKAGE_TYPES = ['urgent', 'awareness', 'action', 'sanctions'] as const;
const COLORS = ['blue', 'red', 'green', 'purple', 'amber', 'emerald'] as const;
const BADGES = ['NEW', 'TRENDING', 'FEATURED', 'HIGH_IMPACT', 'URGENT'] as const;

const SourceSchema = z.object({ name: z.string().min(1), url: z.string().url() });
const VariationSchema = z.object({ subject: z.string().min(1), body: z.string().min(1) });
const LocalizedSchema = z.object({ en: z.string().min(1), fa: z.string().optional(), de: z.string().optional(), fr: z.string().optional() });
const LocalizedKeywordsSchema = z.object({ en: z.array(z.string()).min(1), fa: z.array(z.string()).optional(), de: z.array(z.string()).optional(), fr: z.array(z.string()).optional() });

const RecipientSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), title: z.string().optional(),
  organization: z.string().min(1), type: z.enum(RECIPIENT_TYPES), email: z.string().email(),
  country: z.enum(COUNTRIES), priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  beat: z.array(z.string()).optional(), notes: z.string().optional()
});

const RecipientFileSchema = z.union([
  z.object({ recipients: z.array(RecipientSchema).min(1) }),
  z.array(RecipientSchema).min(1)
]);

const TemplateSchema = z.object({
  id: z.string().min(1), type: z.enum(PACKAGE_TYPES),
  recipientTypes: z.array(z.enum(RECIPIENT_TYPES)).min(1),
  subject: z.string().min(1), body: z.string().min(1),
  variations: z.array(VariationSchema).min(2), sources: z.array(SourceSchema).min(1)
});

const I18nSchema = z.object({
  meta: z.object({ lang: z.string().min(2), dir: z.enum(['ltr', 'rtl']), title: z.string().min(1), description: z.string().min(1) }),
  home: z.record(z.string()), actions: z.record(z.string()), countries: z.record(z.string())
});

const EmailPackageSchema = z.object({
  id: z.string().min(1), version: z.string().min(1),
  meta: z.object({
    type: z.enum(PACKAGE_TYPES), priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    created: z.string().refine(v => !isNaN(Date.parse(v))),
    updated: z.string().refine(v => !isNaN(Date.parse(v)))
  }),
  display: z.object({ title: LocalizedSchema, description: LocalizedSchema, keywords: LocalizedKeywordsSchema, icon: z.string().min(1) }),
  template: z.object({ subject: z.string().min(1), body: z.string().min(10), variations: z.array(VariationSchema).optional().default([]), sources: z.array(SourceSchema).min(1) }),
  recipients: z.object({ ids: z.array(z.string()).min(1), targetingRationale: LocalizedSchema, categories: z.array(z.enum(RECIPIENT_TYPES)).min(1) }),
  ui: z.object({ color: z.enum(COLORS), featured: z.boolean(), badge: z.enum(BADGES).nullable().optional() })
});

function validateFile<T>(filePath: string, schema: z.ZodType<T>, label: string): boolean {
  try {
    schema.parse(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
    console.log(`✅ ${label}: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ ${label}: ${filePath}`);
    if (error instanceof z.ZodError) error.errors.forEach(e => console.error(`   - ${e.path.join('.')}: ${e.message}`));
    else console.error(`   - ${error}`);
    return false;
  }
}

function findJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const fullPath = path.join(dir, item.name);
    return item.isDirectory() ? findJsonFiles(fullPath) : item.name.endsWith('.json') ? [fullPath] : [];
  });
}

async function main(): Promise<void> {
  console.log('🔍 Validating SendForIran data files...\n');
  let allValid = true;
  const cwd = process.cwd();

  const configs = [
    { dir: 'data/recipients', schema: RecipientFileSchema, label: '📋 Recipients', type: 'Recipient' },
    { dir: 'data/templates', schema: TemplateSchema, label: '📝 Templates', type: 'Template' },
    { dir: 'data/i18n', schema: I18nSchema, label: '🌍 i18n', type: 'i18n' },
    { dir: 'data/packages', schema: EmailPackageSchema, label: '📦 Packages', type: 'Package' }
  ];

  for (const { dir, schema, label, type } of configs) {
    console.log(`${label}:`);
    for (const file of findJsonFiles(path.join(cwd, dir))) {
      if (!validateFile(file, schema, type)) allValid = false;
    }
    console.log();
  }

  console.log(allValid ? '✅ All validations passed!' : '❌ Some validations failed.');
  process.exit(allValid ? 0 : 1);
}

main();
