/**
 * JSON Schema Validation Script for SendForIran
 * Validates all data files against defined Zod schemas
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Recipient Schema
const RecipientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  type: z.enum(['journalist', 'media', 'government', 'mp']),
  email: z.string().email(),
  country: z.enum(['united-states', 'united-kingdom', 'germany', 'france', 'canada']),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)])
});

const RecipientFileSchema = z.object({
  recipients: z.array(RecipientSchema).min(5)
});

// Template Schema
const SourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url()
});

const VariationSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1)
});

const TemplateSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['urgent', 'awareness', 'action', 'sanctions']),
  recipientTypes: z.array(z.enum(['journalist', 'media', 'government', 'mp'])).min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  variations: z.array(VariationSchema).min(2),
  sources: z.array(SourceSchema).min(1)
});

// i18n Schema
const I18nSchema = z.object({
  meta: z.object({
    lang: z.string().min(2),
    dir: z.enum(['ltr', 'rtl']),
    title: z.string().min(1),
    description: z.string().min(1)
  }),
  home: z.record(z.string()),
  actions: z.record(z.string()),
  countries: z.record(z.string())
});

// Validation functions
function validateFile<T>(
  filePath: string, 
  schema: z.ZodType<T>, 
  label: string
): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    schema.parse(data);
    console.log(`✅ ${label}: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ ${label}: ${filePath}`);
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => console.error(`   - ${e.path.join('.')}: ${e.message}`));
    } else {
      console.error(`   - ${error}`);
    }
    return false;
  }
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (item.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Main validation
async function main(): Promise<void> {
  console.log('🔍 Validating SendForIran data files...\n');
  let allValid = true;

  // Validate recipients
  console.log('📋 Recipients:');
  const recipientDir = path.join(process.cwd(), 'data/recipients');
  const recipientFiles = findJsonFiles(recipientDir);
  for (const file of recipientFiles) {
    if (!validateFile(file, RecipientFileSchema, 'Recipient')) allValid = false;
  }
  console.log();

  // Validate templates
  console.log('📝 Templates:');
  const templateDir = path.join(process.cwd(), 'data/templates');
  const templateFiles = findJsonFiles(templateDir);
  for (const file of templateFiles) {
    if (!validateFile(file, TemplateSchema, 'Template')) allValid = false;
  }
  console.log();

  // Validate i18n
  console.log('🌍 i18n:');
  const i18nDir = path.join(process.cwd(), 'data/i18n');
  const i18nFiles = findJsonFiles(i18nDir);
  for (const file of i18nFiles) {
    if (!validateFile(file, I18nSchema, 'i18n')) allValid = false;
  }
  console.log();

  // Summary
  if (allValid) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else {
    console.error('❌ Some validations failed.');
    process.exit(1);
  }
}

main();

