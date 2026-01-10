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
├── pages/            # index.astro, [country]/, fa/
├── lib/              # mailto.ts, i18n.ts
└── styles/           # global.css
data/
├── templates/countries/{country}/{lang}/*.json  # NO shared folder
├── recipients/{country}.json
└── i18n/{lang}.json
```

## Schemas

### Template (`data/templates/countries/{country}/{lang}/*.json`)
```typescript
interface Template {
  id: string;
  type: 'urgent' | 'awareness' | 'action' | 'sanctions';
  recipientTypes: ('journalist' | 'media' | 'government' | 'mp')[];
  subject: string;
  body: string;  // Use {{recipientName}}, {{senderCountry}} placeholders
  variations: { subject: string; body: string }[];  // Min 2 for spam avoidance
  sources: { name: string; url: string }[];  // REQUIRED: HRW, Amnesty, etc.
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
- [ ] Static-only, no server code
- [ ] Templates have source citations
- [ ] All UI strings in i18n JSON
- [ ] Fonts self-hosted
- [ ] No external requests
- [ ] Lighthouse 95+
- [ ] RTL tested for Persian

