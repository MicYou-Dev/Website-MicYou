import { defineConfig } from 'vitepress'
import { figure } from '@mdit/plugin-figure'
import { docsSidebar, getSidebarPath } from '../src/docs/sidebar'
import { navTranslations, themeConfigTranslations } from './data/i18n'

// https://vitepress.dev/reference/site-config
export default defineConfig({
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

  head: [
    ['link', { rel: 'icon', href: '/app_icon.png' }],
    ['meta', { name: 'theme-color', content: '#334355' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'MicYou' }],
    ['meta', { property: 'og:description', content: '将 Android 设备转变为 PC 的高质量麦克风' }],
    ['meta', { property: 'og:image', content: '/app_icon.png' }],
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
    logo: '/app_icon.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/LanRhyme/MicYou' },
      { icon: 'telegram', link: 'https://t.me/MicYouChannel' }
    ]
  }
})