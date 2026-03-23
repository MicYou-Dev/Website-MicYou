<div align="center">
 
# MicYou Website
  
<img src="https://socialify.git.ci/MicYou-Dev/Website-MicYou/image?description=1&issues=1&language=1&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNOS44NzUgMTMuMTI1UTkgMTIuMjUgOSAxMVY1cTAtMS4yNS44NzUtMi4xMjVUMTIgMnQyLjEyNS44NzVUMTUgNXY2cTAgMS4yNS0uODc1IDIuMTI1VDEyIDE0dC0yLjEyNS0uODc1TTExIDIwdi0yLjA3NXEtMi4zLS4zMjUtMy45MzctMS45NXQtMS45ODgtMy45NXEtLjA1LS40MjUuMjI1LS43MjVUNiAxMXQuNzEzLjI4OFQ3LjEgMTJxLjM1IDEuNzUgMS43MzggMi44NzVUMTIgMTZxMS44IDAgMy4xNzUtMS4xMzdUMTYuOSAxMnEuMS0uNDI1LjM4OC0uNzEyVDE4IDExdC43LjN0LjIyNS43MjVxLS4zNSAyLjI3NS0xLjk3NSAzLjkyNVQxMyAxNy45MjVWMjBxMCAuNDI1LS4yODguNzEzVDEyIDIxdC0uNzEyLS4yODhUMTEgMjBtMS43MTMtOC4yODdRMTMgMTEuNDI1IDEzIDExVjVxMC0uNDI1LS4yODgtLjcxMlQxMiA0dC0uNzEyLjI4OFQxMSA1djZxMCAuNDI1LjI4OC43MTNUMTIgMTJ0LjcxMy0uMjg4Ii8%2BPC9zdmc%2B&owner=1&pulls=1&stargazers=1&theme=Dark" alt="Website-MicYou"/>

---

**Official Website for MicYou**

Transform your Android device into a high-quality microphone for PC

[![Deploy][badge-deploy]][deploy-url]
[![License][badge-license]][license-url]
[![VitePress][badge-vitepress]][vitepress-url]
[![Vue][badge-vue]][vue-url]
[![pnpm][badge-pnpm]][pnpm-url]

[Live Site][live-site] | [Main Project][main-project] | [Telegram][telegram] | [Report Issues][report-issues]

</div>

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
├── .agent/                 # AI agent configuration: set the agent name (e.g., .qwen).
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

[Live Site](live-site) <- ***Click Me!***

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

<!-- Badge References -->
[badge-deploy]: https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml/badge.svg
[badge-license]: https://img.shields.io/badge/License-MIT-yellow.svg
[badge-vitepress]: https://img.shields.io/badge/VitePress-2.0.0--alpha-646cff?logo=vitepress&logoColor=white
[badge-vue]: https://img.shields.io/badge/Vue-3.5-4fc08d?logo=vue.js&logoColor=white
[badge-pnpm]: https://img.shields.io/badge/pnpm-10.x-f69220?logo=pnpm&logoColor=white

<!-- URL References -->
[deploy-url]: https://github.com/LanRhyme/Website-MicYou/actions/workflows/deploy.yml
[license-url]: https://opensource.org/licenses/MIT
[vitepress-url]: https://vitepress.dev/
[vue-url]: https://vuejs.org/
[pnpm-url]: https://pnpm.io/
[live-site]: https://micyou.top/
[main-project]: https://github.com/LanRhyme/MicYou
[telegram]: https://t.me/MicYouChannel
[report-issues]: https://github.com/LanRhyme/Website-MicYou/issues
