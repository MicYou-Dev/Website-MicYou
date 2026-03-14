# MicYou Website

[![Deploy to GitHub Pages](https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml/badge.svg)](https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official documentation website for [MicYou](https://github.com/LanRhyme/MicYou) - an application that transforms your Android device into a high-quality microphone for PC.

## Features

- **Multi-language Support** - Simplified Chinese, English, and Traditional Chinese
- **Modern Design** - Built with VitePress and Vue 3
- **Fast & Lightweight** - Static site with excellent performance
- **Auto Deployment** - Continuous deployment via GitHub Actions

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/LanRhyme/Website-MicYou.git
cd Website-MicYou

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The site will be available at `http://localhost:5173` (or next available port).

### Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [VitePress](https://vitepress.dev/) | 2.0.0-alpha | Static site generator |
| [Vue](https://vuejs.org/) | 3.5 | Frontend framework |
| [@theojs/lumen](https://github.com/Theo-M/mp-lumen) | 6.4 | Theme components |
| [pnpm](https://pnpm.io/) | 10.x | Package manager |

## Project Structure

```
.
├── .agent/                 # AI agent configuration
├── .github/workflows/      # GitHub Actions
├── .vitepress/
│   ├── config.mts          # VitePress configuration
│   ├── data/lang/          # Language translations
│   └── theme/              # Custom theme & components
├── src/
│   ├── index.md            # Homepage (zh-CN)
│   ├── docs/               # Documentation (zh-CN)
│   ├── en/                 # English content
│   ├── zh-TW/              # Traditional Chinese content
│   └── public/             # Static assets
├── CONTRIBUTING.md
└── README.md
```

## Internationalization

| Language | Code | Path |
|----------|------|------|
| 简体中文 | `zh-CN` | `/` |
| English | `en` | `/en/` |
| 繁體中文 | `zh-TW` | `/zh-TW/` |

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

[Live Site](https://lanrhyme.github.io/Website-MicYou/)

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## Related Links

- [MicYou App](https://github.com/LanRhyme/MicYou) - Main application repository
- [Telegram Channel](https://t.me/MicYouChannel) - News and updates
- [Report Issues](https://github.com/LanRhyme/Website-MicYou/issues) - Bug reports and suggestions

## License

[MIT](./LICENSE) Copyright 2026 LanRhyme