# MicYou Website

<div align="center">

**Official Documentation Website for MicYou**

Transform your Android device into a high-quality microphone for PC

[![Deploy to GitHub Pages](https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml/badge.svg)](https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VitePress](https://img.shields.io/badge/VitePress-2.0.0--alpha-646cff?logo=vitepress&logoColor=white)](https://vitepress.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4fc08d?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[Live Site](https://lanrhyme.github.io/Website-MicYou/) | [Main Project](https://github.com/LanRhyme/MicYou) | [Telegram](https://t.me/MicYouChannel) | [Report Issues](https://github.com/LanRhyme/Website-MicYou/issues)

</div>

---

## Features

- **Multi-language Support** - Simplified Chinese, English, and Traditional Chinese
- **Modern Design** - Built with VitePress and Vue 3
- **Fast & Lightweight** - Static site with excellent performance
- **Auto Deployment** - Continuous deployment via GitHub Actions
- **Responsive Layout** - Optimized for desktop and mobile devices

## Quick Start

### Prerequisites

| Dependency | Version |
|------------|---------|
| [Node.js](https://nodejs.org/) | >= 22 |
| [pnpm](https://pnpm.io/) | >= 10 |

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

The site will be available at `http://localhost:5173`.

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
| [@theojs/lumen](https://github.com/s-theo/lumen) | 6.4 | Theme component library |
| [pnpm](https://pnpm.io/) | 10.x | Package manager |
| [Biome](https://biomejs.dev/) | 2.x | Code formatting and linting |

## Project Structure

```
Website-MicYou/
├── .agent/                 # AI agent configuration
├── .github/workflows/      # GitHub Actions workflows
├── .vitepress/
│   ├── config.mts          # VitePress configuration
│   ├── data/lang/          # i18n translation files
│   └── theme/              # Custom theme and components
├── src/
│   ├── index.md            # Homepage (zh-CN)
│   ├── docs/               # Documentation pages (zh-CN)
│   ├── en/                 # English content
│   ├── zh-TW/              # Traditional Chinese content
│   └── public/             # Static assets
├── CONTRIBUTING.md         # Contribution guide
└── README.md               # Project readme
```

## Internationalization

| Language | Code | Path |
|:--------:|:----:|:----:|
| Simplified Chinese | `zh-CN` | `/` |
| English | `en` | `/en/` |
| Traditional Chinese | `zh-TW` | `/zh-TW/` |

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live Site**: [https://lanrhyme.github.io/Website-MicYou/](https://lanrhyme.github.io/Website-MicYou/)

## Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Contribution Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Links

| Link | Description |
|------|-------------|
| [MicYou App](https://github.com/LanRhyme/MicYou) | Main application repository |
| [Telegram Channel](https://t.me/MicYouChannel) | News and updates |
| [Issue Tracker](https://github.com/LanRhyme/Website-MicYou/issues) | Bug reports and suggestions |

## License

[MIT License](./LICENSE)

Copyright © 2026 LanRhyme
