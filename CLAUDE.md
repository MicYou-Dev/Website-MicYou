# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MicYou Website is a VitePress 2.0.0-alpha static site for the MicYou Android microphone app. Built with Vue 3, uses pnpm as package manager, and Biome for formatting/linting.

## Commands

```bash
pnpm dev          # Start dev server at localhost:5173
pnpm build        # Production build (output: .vitepress/dist/)
pnpm preview      # Preview production build locally
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome (auto-fix)
pnpm fetch:ghdata # Fetch GitHub release/contributor data to src/ghdata.json
```

No test framework is configured.

## Architecture

### Source Structure

- `src/` — VitePress source directory (configured via `srcDir: "./src"` in config)
  - `index.md`, `download.md`, `video.md`, `changelog.md` — Top-level pages (zh-CN default)
  - `docs/` — Documentation pages with sidebar config in `sidebar.ts`
  - `en/`, `zh-TW/` — Translated content mirroring `src/` structure
  - `ghdata.json` — Auto-generated GitHub release/contributor data (do not edit manually)
  - `public/` — Static assets (images, favicon)
- `.vitepress/`
  - `config.mts` — Main VitePress config: locales, SEO, head tags, markdown plugins
  - `data/i18n.ts` — Central i18n exports (nav, footer, component translations)
  - `data/lang/zh.ts`, `en.ts`, `zh_tw.ts` — Per-language UI translations
  - `theme/` — Custom theme extending `vitepress/theme-without-fonts`
    - `index.ts` — Theme entry: registers global components, Umami analytics, footer
    - `components/` — Vue components: DownloadSection, ChangelogViewer, ContributorsCards, UmamiStats, ViewTrans
    - `style.css`, `blur.css` — Global styles
- `scripts/` — Build-time scripts (TypeScript, run via `npx tsx`)

### i18n Pattern

Three locales: `zh-CN` (root/default), `en`, `zh-TW`. Content must be created in all three locations:
- `src/<page>.md` → `src/en/<page>.md` → `src/zh-TW/<page>.md`

UI translations live in `.vitepress/data/lang/` and are exported through `.vitepress/data/i18n.ts`. Sidebar config uses `sidebarTranslations` in `src/docs/sidebar.ts`.

### Key Dependencies

- `@theojs/lumen` — Theme component library (BoxCube, Card, Links, Pill, Footer, CopyText, umamiAnalytics)
- `@mdit/plugin-figure` — Markdown figure plugin for images
- `marked` — Markdown parsing
- `iconify-icon` — Icon component (registered as custom element in VitePress config)

## Conventions

- **Formatting**: Biome with tabs, double quotes for JS/TS
- **Vue files**: Biome linting rules for `noUnusedImports` and `noUnusedVariables` are disabled for `.vue` files
- **Pre-commit hook**: Husky runs `lint-staged` which auto-formats staged `*.{js,ts,vue,json,mts,mjs,cjs,cts}` files
- **Commit messages**: Conventional commits format (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **Frontmatter**: All doc pages require `title` and `description` fields for SEO
- **Images**: Place in `src/public/`, reference with root-relative paths (`/image.png`)
- **External image links**: Do not use (GitHub attachments, external URLs)

## Environment

- Node.js >= 22, pnpm >= 10
- `.env` / `.env.local` — Contains `GH_TOKEN` for `fetch:ghdata` script
- Site URL: `https://micyou.top`
