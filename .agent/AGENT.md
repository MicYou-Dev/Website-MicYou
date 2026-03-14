# Agent Guide - MicYou Website

This document provides project context and development guidelines for AI agents.

## Project Overview

MicYou Website is the official documentation site for the MicYou application. MicYou transforms Android devices into high-quality microphones for PC.

### Core Features

- Multiple connection modes: Wi-Fi, USB (ADB/AOA), Bluetooth
- Professional audio processing: noise suppression, AGC, de-reverberation
- Virtual microphone support (with VB-Cable)
- Cross-platform: Windows, Linux, macOS

## Tech Stack

| Technology | Purpose |
|------------|---------|
| VitePress 2.0.0-alpha | Static site generator |
| Vue 3.5 | Frontend framework |
| @theojs/lumen 6.4 | Theme component library |
| pnpm 10.x | Package manager |
| TypeScript | Type support |

## Project Structure

```
.
├── .agent/              # AI agent configuration
│   ├── AGENT.md         # Agent guide
│   └── Skill.md         # Skill definitions
├── .github/
│   └── workflows/       # GitHub Actions deployment
├── .vitepress/
│   ├── config.mts       # Main VitePress config
│   ├── cache/           # Build cache
│   ├── data/            # i18n translation data
│   │   ├── i18n.ts      # Translation entry
│   │   └── lang/        # Language files
│   │       ├── zh.ts    # Simplified Chinese
│   │       ├── en.ts    # English
│   │       └── zh_tw.ts # Traditional Chinese
│   ├── theme/           # Custom theme
│   │   ├── index.ts     # Theme entry
│   │   ├── style.css    # Custom styles
│   │   └── components/  # Custom components
│   └── dist/            # Build output
├── src/
│   ├── index.md         # Homepage
│   ├── docs/            # Documentation pages
│   │   ├── sidebar.ts   # Sidebar config
│   │   ├── quick-start.md
│   │   └── faq.md
│   ├── en/              # English content
│   ├── zh-TW/           # Traditional Chinese content
│   └── public/          # Static assets
├── package.json
└── pnpm-lock.yaml
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview build result
pnpm preview
```

## Internationalization (i18n)

Three languages are supported:

| Code | Language | Path Prefix |
|------|----------|-------------|
| zh-CN | Simplified Chinese | `/` (root) |
| en | English | `/en/` |
| zh-TW | Traditional Chinese | `/zh-TW/` |

### Steps to Add a New Language

1. Create a language file in `.vitepress/data/lang/` (e.g., `ja.ts`)
2. Import and register it in `.vitepress/data/i18n.ts`
3. Add configuration to `locales` in `.vitepress/config.mts`
4. Create corresponding language directory under `src/`
5. Update translations in `src/docs/sidebar.ts`

## Theme Customization

The project uses the `@theojs/lumen` theme component library, providing:

- `Footer` - Footer component
- `BoxCube` - Box display component
- `Card` - Card component
- `Links` - Links component
- `Pill` - Pill tag component

### Custom Components

Located in `.vitepress/theme/components/`:

- `Contributors` - Contributor display component

## Adding New Documentation

1. Create a Markdown file in `src/docs/`
2. Create translations in `src/en/docs/` and `src/zh-TW/docs/`
3. Update sidebar links in `src/docs/sidebar.ts`
4. Update language translation configs if needed

## Deployment

- Automatic deployment to GitHub Pages via GitHub Actions
- Triggered on push to main branch
- Build output located in `.vitepress/dist/`

## Code Standards

- Use TypeScript for configuration files
- Markdown files use frontmatter for page configuration
- Components use Vue 3 Composition API
- Follow VitePress official documentation standards

## Notes

- Node.js version requirement: 22 or higher
- Use pnpm as package manager (not npm/yarn)
- `.vitepress/dist/` and `.vitepress/cache/` are gitignored
- When modifying i18n, update all three languages synchronously