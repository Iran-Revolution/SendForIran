# SendForIran - Project Rules

## Core Principles
| Principle | Rule |
|-----------|------|
| **Static-Only** | No server, no database, no API keys, GitHub Pages hosting |
| **Privacy-First** | Zero tracking, no cookies, no external calls, self-host everything |
| **KISS** | Max 30 lines/function, max 100 lines/file |

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Astro 5 + TypeScript |
| Styling | Tailwind CSS |
| Interactive | Preact islands (3KB) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## Project Structure
```
src/
├── components/       # Astro components (.astro)
├── islands/          # Preact interactive (.tsx)
├── layouts/          # BaseLayout.astro
├── pages/            # index.astro, [country]/, packages/[country].astro
├── lib/              # packages.ts, mailto.ts, i18n.ts
└── styles/           # global.css
data/
├── packages/{country}/{lang}/*.json  # Curated email packages
├── recipients/{country}.json
└── i18n/{lang}.json
```

## Schemas

### EmailPackage (`data/packages/{country}/{lang}/*.json`)
```typescript
interface EmailPackage {
  id: string;
  name: Record<string, string>;  // {"en": "...", "fa": "..."}
  description: Record<string, string>;
  template: { subject: string; body: string; variations?: {...}[] };
  recipientIds: string[];  // Pre-matched recipients
  sources: { name: string; url: string }[];  // REQUIRED
}
```

### Recipient (`data/recipients/{country}.json`)
```typescript
interface Recipient {
  id: string; name: string; title: string; organization: string;
  type: 'journalist' | 'media' | 'government' | 'mp';
  email: string; country: string; priority: 1 | 2 | 3;
}
```

## Design Tokens
| Colors | Hex | | Spacing | |
|--------|-----|--|---------|--|
| Primary | `#2563EB` | | xs/sm/md/lg | 4/8/16/24px |
| Urgent | `#DC2626` | | Radius | 4/8/12/16px |
| Background | `#0F172A` | | | |
| Surface | `#1E293B` | | | |
| Text | `#F8FAFC` | | | |

**Typography**: Inter (EN), Vazirmatn (FA) - self-hosted only

## i18n
- Supported: `en`, `fa` (RTL), `de`, `fr`
- URL: `/` (EN), `/fa/`, `/de/`
- RTL: `dir="rtl"`, logical properties (`margin-inline-start`)

## Performance Budget
| Asset | Limit | | Lighthouse | 95+ all |
|-------|-------|--|------------|---------|
| Total | <80KB | | HTML/CSS/JS | <15/10/5KB |

## Naming
| Type | Style | Example |
|------|-------|---------|
| Files | kebab-case | `email-composer.astro` |
| Components | PascalCase | `EmailComposer` |
| Functions | camelCase | `generateMailto` |

## Commands
```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm preview      # Preview build
pnpm lint         # ESLint + type-check
pnpm validate     # Schema validation
```

## Checklist
- [ ] Static-only, no server 
- [ ] Source citations 
- [ ] i18n strings 
- [ ] Self-hosted fonts

