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

### Add a Template

1. Fork this repository
2. Create file: `data/templates/countries/{country}/{lang}/{template-name}.json`
3. Follow this schema:

```json
{
  "id": "country-type-name",
  "type": "urgent",
  "recipientTypes": ["journalist", "media"],
  "subject": "Subject line with {{recipientName}} placeholder",
  "body": "Email body...\n\nSincerely,\n{{senderCountry}} resident",
  "variations": [
    { "subject": "Alternative subject", "body": "Alternative body..." }
  ],
  "sources": [
    { "name": "Iran Human Rights", "url": "https://iranhr.net" }
  ]
}
```

**Requirements:**
- `sources` array is **MANDATORY** - cite HRW, Amnesty, IranHR, etc.
- Include 2+ `variations` to avoid spam filters
- Use placeholders: `{{recipientName}}`, `{{senderCountry}}`, `{{currentDate}}`

4. Submit PR

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

