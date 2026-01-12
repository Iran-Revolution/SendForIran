# SendForIran

One-click email templates for Iranian diaspora advocacy.

> **Current Crisis**: Since December 28, 2025, massive protests across Iran. 51+ killed, 2,270+ detained, nationwide internet blackout. SendForIran helps amplify diaspora voices.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [localhost:4321](http://localhost:4321)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint + type-check |
| `pnpm validate` | Validate JSON schemas |

## Deploy

Push to `main` → auto-deploys to GitHub Pages via GitHub Actions.

## Tech Stack

- **Astro 5** - Static site generator
- **Tailwind CSS** - Styling
- **Preact** - Interactive islands (3KB)
- **GitHub Pages** - Hosting

## Project Structure

```
src/
├── components/     # Astro components
├── islands/        # Preact interactive components
├── layouts/        # Page layouts
├── pages/          # Routes
└── lib/            # Utilities

data/
├── packages/{country}/                     # Email packages
├── recipients/{country}/recipients.json    # Contact lists
└── i18n/{lang}.json                        # UI translations
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Privacy

- Zero analytics or tracking
- No cookies
- No external requests
- All assets self-hosted

## License

MIT


TODOs:
- [ ] 