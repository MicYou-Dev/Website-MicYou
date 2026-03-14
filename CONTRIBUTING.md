# Contributing to MicYou Website

Thank you for your interest in contributing! This guide will help you get started.

## Quick Links

- [Issue Tracker](https://github.com/LanRhyme/Website-MicYou/issues)
- [Pull Requests](https://github.com/LanRhyme/Website-MicYou/pulls)
- [Telegram Channel](https://t.me/MicYouChannel)

## Ways to Contribute

### Report Issues

Found a bug or have a suggestion?

1. Search [existing issues](https://github.com/LanRhyme/Website-MicYou/issues) first
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Submit Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

### Requirements

- Node.js 22+
- pnpm 10+

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Website-MicYou.git
cd Website-MicYou

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |

## Coding Standards

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-japanese-support` |
| Fix | `fix/description` | `fix/broken-navigation-link` |
| Docs | `docs/description` | `docs/update-installation-guide` |
| Chore | `chore/description` | `chore/update-dependencies` |

### Commit Messages

Follow conventional commits format:

```
<type>: <description>

[optional body]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `chore` - Maintenance tasks

**Examples:**
```
feat: add Japanese language support
fix: resolve broken link in quick-start.md
docs: update FAQ with new troubleshooting steps
```

### Code Style

- Use TypeScript for configuration files
- Follow existing code formatting
- Keep components focused and small
- Use Vue 3 Composition API

## Documentation Guidelines

### Adding New Pages

1. Create the page in all supported languages:
   ```
   src/docs/new-page.md          # Chinese (default)
   src/en/docs/new-page.md       # English
   src/zh-TW/docs/new-page.md    # Traditional Chinese
   ```

2. Update `src/docs/sidebar.ts`:
   ```ts
   const sidebarTranslations = {
     'zh-CN': { /* add translation */ },
     'en': { /* add translation */ },
     'zh-TW': { /* add translation */ }
   }
   ```

### Markdown Guidelines

- Use proper heading hierarchy (h1 → h2 → h3)
- Include language in code blocks:
  ````markdown
  ```bash
  pnpm install
  ```
  ````
- Keep lines under 100 characters
- Use relative links for internal references

### Translation Guidelines

- Maintain consistent terminology across languages
- Keep translations natural, not literal
- Update all languages simultaneously
- Check `.vitepress/data/lang/` for UI translations

## Pull Request Process

### Before Submitting

- [ ] Code builds without errors (`pnpm build`)
- [ ] All languages updated (if applicable)
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with `main`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Checklist
- [ ] Tested locally
- [ ] Updated all language versions
- [ ] Updated sidebar config (if needed)

## Related Issues
Fixes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, it will be merged

## Need Help?

- Open an [issue](https://github.com/LanRhyme/Website-MicYou/issues) for questions
- Join our [Telegram](https://t.me/MicYouChannel) for discussions

---

Thank you for contributing!