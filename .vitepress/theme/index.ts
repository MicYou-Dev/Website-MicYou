// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import '@theojs/lumen/style'
import { Footer, BoxCube, Card, Links, Pill } from '@theojs/lumen'
import { getFooterData, type Lang } from '../data/i18n'
import Contributors from './components/ContributorsCards/Contributors.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => {
        // 从 VitePress 获取当前语言
        const { lang } = useData()
        const currentLang = (lang.value || 'zh-CN') as Lang
        const footerData = getFooterData(currentLang)
        return h(Footer, { Footer_Data: footerData })
      }
    })
  },
  enhanceApp({ app }) {
    // 注册 lumen 组件
    app.component('BoxCube', BoxCube)
    app.component('Card', Card)
    app.component('Links', Links)
    app.component('Pill', Pill)
    // 注册贡献者组件
    app.component('Contributors', Contributors)
  }
} satisfies Theme