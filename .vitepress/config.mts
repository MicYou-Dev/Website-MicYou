import { defineConfig } from 'vitepress'
import { figure } from '@mdit/plugin-figure'
import { docsSidebar, getSidebarPath } from '../src/docs/sidebar'
import { navTranslations, themeConfigTranslations } from './data/i18n'
import { withPwa } from '@vite-pwa/vitepress'

// https://vitepress.dev/reference/site-config
export default withPwa(defineConfig({
  srcDir: "./src",
  title: "MicYou",
  description: "将 Android 设备转变为 PC 的高质量麦克风",
  cleanUrls: true,

  markdown: {
    config: (md) => {
      md.use(figure)
    }
  },

  // 支持 iconify-icon 组件
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag === 'iconify-icon' }
    }
  },

  // Vite 构建优化
  vite: {
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          // 将第三方库分离到单独的 chunk
          manualChunks: {
            'lumen': ['@theojs/lumen']
          }
        }
      },
      // 压缩配置
      minify: 'esbuild',
      // CSS 代码分割
      cssCodeSplit: true,
      // 启用 source map 用于调试（生产环境可关闭）
      sourcemap: false
    }
  },

  // PWA 配置
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'app_icon.png', 'app_icon.webp'],
    manifest: {
      name: 'MicYou',
      short_name: 'MicYou',
      description: '将 Android 设备转变为 PC 的高质量麦克风',
      theme_color: '#334355',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/app_icon.webp',
          sizes: '1024x1024',
          type: 'image/webp'
        },
        {
          src: '/app_icon.png',
          sizes: '1024x1024',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,webp,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/avatars\.githubusercontent\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'github-avatars-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
            }
          }
        }
      ]
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/app_icon.png' }],
    ['meta', { name: 'theme-color', content: '#334355' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'MicYou' }],
    ['meta', { property: 'og:description', content: '将 Android 设备转变为 PC 的高质量麦克风' }],
    ['meta', { property: 'og:image', content: '/app_icon.png' }],
    // 预连接到 GitHub API 和头像服务
    ['link', { rel: 'preconnect', href: 'https://api.github.com' }],
    ['link', { rel: 'preconnect', href: 'https://github.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://avatars.githubusercontent.com' }],
    // 预连接到 Telegram
    ['link', { rel: 'dns-prefetch', href: 'https://t.me' }],
  ],

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'MicYou',
      description: '将 Android 设备转变为 PC 的高质量麦克风 - 高质量、低延迟、跨平台的音频传输解决方案',
      themeConfig: {
        nav: navTranslations['zh-CN'],
        sidebar: { [getSidebarPath('zh-CN')]: docsSidebar('zh-CN') },
        ...themeConfigTranslations['zh-CN']
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'MicYou',
      description: 'Transform your Android device into a high-quality microphone for PC - High quality, low latency, cross-platform audio transmission solution',
      themeConfig: {
        nav: navTranslations['en'],
        sidebar: { [getSidebarPath('en')]: docsSidebar('en') },
        ...themeConfigTranslations['en']
      }
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      title: 'MicYou',
      description: '將 Android 裝置轉變為 PC 的高品質麥克風 - 高品質、低延遲、跨平台的音訊傳輸解決方案',
      themeConfig: {
        nav: navTranslations['zh-TW'],
        sidebar: { [getSidebarPath('zh-TW')]: docsSidebar('zh-TW') },
        ...themeConfigTranslations['zh-TW']
      }
    }
  },

  themeConfig: {
    logo: '/app_icon.webp',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/LanRhyme/MicYou' },
      { icon: 'telegram', link: 'https://t.me/MicYouChannel' }
    ]
  }
}))