# Contributing to SendForIran

Thank you for helping amplify Iranian voices. Contributions welcome!

## Quick Contributions (No Code Required)

### Add a Recipient

1. Fork this repository
2. Edit `data/recipients/{country}.json`
3. Add entry following this schema:

```json
{
  "id": "unique-id",
  "name": "Full Name",
  "title": "Job Title",
  "organization": "Organization Name",
  "type": "journalist",
  "email": "public@email.com",
  "country": "us",
  "priority": 1
}
```

| Field | Required | Values |
|-------|----------|--------|
| `type` | ✅ | `journalist`, `media`, `government`, `mp` |
| `priority` | ✅ | `1` (highest), `2`, `3` |
| `email` | ✅ | Must be publicly available |

4. Submit PR with source link for contact info

### Add an Email Package

An Email Package bundles a template with pre-matched recipients for one-click sending.

1. Fork this repository
2. Create file: `data/packages/{country}/{lang}/{package-name}.json`
3. Follow this schema (see `src/types/package.ts` for full TypeScript interface):

```json
{
  "id": "us-awareness-example",
  "version": "1.0",
  "meta": {
    "type": "awareness",
    "priority": 2,
    "created": "2026-01-11",
    "updated": "2026-01-11"
  },
  "display": {
    "title": { "en": "Package Title", "fa": "عنوان بسته" },
    "description": { "en": "Brief description", "fa": "توضیحات کوتاه" },
    "keywords": { "en": ["iran", "human-rights"], "fa": ["ایران"] },
    "icon": "📧"
  },
  "template": {
    "subject": "Subject with {{recipientName}}",
    "body": "Email body...\n\nSincerely,\nA {{senderCountry}} resident",
    "variations": [],
    "sources": [{ "name": "Iran Human Rights", "url": "https://iranhr.net" }]
  },
  "recipients": {
    "ids": ["recipient-id-1", "recipient-id-2"],
    "targetingRationale": { "en": "Why these recipients", "fa": "چرا این گیرندگان" },
    "categories": ["journalist", "media"]
  },
  "ui": {
    "color": "blue",
    "featured": false,
    "badge": null
  }
}
```

**Required Fields:**
| Field | Description |
|-------|-------------|
| `template.sources` | **MANDATORY** - cite HRW, Amnesty, IranHR, etc. |
| `recipients.ids` | Must reference IDs in `data/recipients/{country}/*.json` |
| `display.title.en` | English title required |
| `meta.type` | One of: `urgent`, `awareness`, `action`, `sanctions` |
| `ui.color` | One of: `blue`, `red`, `green`, `purple`, `amber`, `emerald` |

**Optional Fields:**
| Field | Values |
|-------|--------|
| `ui.badge` | `NEW`, `TRENDING`, `FEATURED`, `HIGH_IMPACT`, `URGENT` |
| `template.variations` | Array of alternate subject/body pairs |

4. Run `pnpm validate` to check your JSON
5. Submit PR with source citations

### Add a Translation

1. Fork this repository
2. Copy `data/i18n/en.json` to `data/i18n/{lang}.json`
3. Translate all values (keep keys in English)
4. Submit PR

## Development Setup

```bash
git clone https://github.com/Iran-Revolution/SendForIran.git
cd SendForIran
pnpm install
pnpm dev
```

## Code Guidelines

See [PROJECT_RULES.md](./PROJECT_RULES.md) for:
- Project structure
- TypeScript schemas
- Design tokens
- Naming conventions
- Performance budget

### Key Rules

- **Static-only**: No server code, no API calls
- **Privacy-first**: No analytics, no cookies
- **Max 100 lines per file**
- **All UI strings in i18n JSON**
- **Self-host all assets** (fonts, images)

## Validation

Before submitting PR, run:

```bash
pnpm lint      # No errors allowed
pnpm validate  # All JSON must pass schema validation
pnpm build     # Must build successfully
```

## Pull Request Process

1. Create feature branch from `main`
2. Make changes
3. Run validation commands
4. Submit PR with description of changes
5. Wait for review

## Questions?

Open an issue with the `question` label.

