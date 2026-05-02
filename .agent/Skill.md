# Skill Definitions - MicYou Website

This document defines available skills and workflows for the project.

## Available Skills

### 1. Add Document (add-doc)

Add a new documentation page with automatic multi-language translation and navigation config.

**Trigger**: User requests to add a new documentation page

**Steps**:
1. Create Chinese Markdown file in `src/docs/`
2. Create English version in `src/en/docs/`
3. Create Traditional Chinese version in `src/zh-TW/docs/`
4. Update sidebar config in `src/docs/sidebar.ts`
5. Update language files in `.vitepress/data/lang/` if needed

**Template**:

```markdown
---
title: Document Title - Site Name
description: Brief description for SEO (150-160 characters recommended).
---

# Document Title

Content...
```

**Frontmatter Requirements:**

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Page title with site name suffix | `快速开始 - MicYou 安装配置指南` |
| `description` | SEO description | `MicYou 快速开始指南，详细介绍如何安装和配置 MicYou。` |

**Note:** Homepage uses `layout: home` configuration instead of standard frontmatter.

---

### 2. Update i18n (update-i18n)

Update or add new translation content.

**Trigger**: User requests to add a new language or update translations

**Steps**:
1. Identify key-value pairs that need translation
2. Update language files in `.vitepress/data/lang/`
3. Ensure all three languages (zh-CN, en, zh-TW) are updated synchronously

**Language File Structure**:

```typescript
// Navigation
export const nav = [
  { text: 'Text', link: '/path' }
]

// Theme config
export const themeConfig = {
  editLink: { pattern: '...', text: '...' },
  lastUpdated: { text: '...' },
  docFooter: { prev: '...', next: '...' },
  outline: { label: '...' },
  returnToTopLabel: '...'
}

// Contributors component
export const contributors = {
  title: '...',
  subtitle: '...'
}

// Footer data
export function getFooterData(): FooterData {
  return {
    // ...
  }
}
```

---

### 3. Create Component (create-component)

Create custom Vue components.

**Trigger**: User requests to create a new UI component

**Steps**:
1. Create component directory in `.vitepress/theme/components/`
2. Write Vue 3 component using Composition API
3. Register component in `.vitepress/theme/index.ts`
4. Add necessary styles to `style.css`

**Component Template**:

```vue
<script setup lang="ts">
import { ref } from 'vue'

// Props definition
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="component-name">
    {{ title }}
  </div>
</template>

<style scoped>
.component-name {
  /* styles */
}
</style>
```

---

### 4. Build & Preview (build-preview)

Build the project and preview the result.

**Trigger**: User requests to build or preview the website

**Steps**:
1. Run `pnpm build` to build the project
2. Check build output for errors
3. Run `pnpm preview` to start preview server
4. Provide preview URL

**Notes**:
- Ensure all dependencies are installed before building
- Check `.vitepress/dist/` output directory

---

### 5. Sync Check (sync-check)

Check if multi-language content is synchronized.

**Trigger**: User requests to check translation completeness

**Steps**:
1. Scan all Markdown files in `src/docs/`
2. Compare corresponding files in `src/en/docs/` and `src/zh-TW/docs/`
3. Report missing or out-of-sync files
4. Check if sidebar.ts config covers all documents

---

### 6. Fetch GitHub Data (fetch-gh-data)

Fetch GitHub releases and statistics data.

**Trigger**: User requests to update GitHub data or before deployment

**Steps**:
1. Run `pnpm fetch:ghdata` to fetch latest data
2. Data is saved to `src/public/ghdata.json`
3. Used by ChangelogViewer and other components

**Notes**:
- Requires network access to GitHub API
- Data includes releases, download counts, etc.

---

## Workflow Examples

### Add "Installation Guide" Document

```
User: Add an installation guide document

Execute:
1. Create src/docs/installation.md
2. Create src/en/docs/installation.md
3. Create src/zh-TW/docs/installation.md
4. Update src/docs/sidebar.ts:
   - Add translations to sidebarTranslations for each language
   - Add link item in docsSidebar return value
5. Verify correct display in dev server
```

### Add Japanese Support

```
User: Add Japanese language support

Execute:
1. Create .vitepress/data/lang/ja.ts
2. Update .vitepress/data/i18n.ts:
   - Import ja.ts
   - Add to navTranslations
   - Add to contributorsTranslations
   - Add to themeConfigTranslations
   - Update getFooterData function
3. Update .vitepress/config.mts:
   - Add 'ja' config to locales
4. Update src/docs/sidebar.ts:
   - Add 'ja' type
   - Add sidebarTranslations['ja']
5. Create src/ja/ directory structure
6. Copy and translate homepage and document files
```

---

## Quick Command Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (includes fetch:ghdata) |
| `pnpm preview` | Preview build result |
| `pnpm install` | Install dependencies |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm fetch:ghdata` | Fetch GitHub data |

## Related Links

- [VitePress Documentation](https://vitepress.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [@theojs/lumen](https://github.com/s-theo/lumen)
- [pnpm Documentation](https://pnpm.io/)