import { DefaultTheme } from "vitepress";

type Lang = 'zh-CN' | 'en' | 'zh-TW'

// 侧边栏翻译
const sidebarTranslations = {
  'zh-CN': {
    examples: '示例',
    markdownExamples: 'Markdown 示例',
    apiExamples: '运行时 API 示例'
  },
  'en': {
    examples: 'Examples',
    markdownExamples: 'Markdown Examples',
    apiExamples: 'Runtime API Examples'
  },
  'zh-TW': {
    examples: '範例',
    markdownExamples: 'Markdown 範例',
    apiExamples: '執行時 API 範例'
  }
}

// 获取侧边栏配置
export function docsSidebar(lang: Lang = 'zh-CN'): DefaultTheme.SidebarItem[] {
  const t = sidebarTranslations[lang]
  const prefix = lang === 'zh-CN' ? '' : `/${lang}`

  return [
    {
      text: t.examples,
      items: [
        { text: t.markdownExamples, link: `${prefix}/docs/markdown-examples` },
        { text: t.apiExamples, link: `${prefix}/docs/api-examples` }
      ]
    }
  ]
}

// 获取侧边栏路径
export function getSidebarPath(lang: Lang): string {
  return lang === 'zh-CN' ? '/docs/' : `/${lang}/docs/`
}