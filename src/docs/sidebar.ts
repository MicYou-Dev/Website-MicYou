import type { DefaultTheme } from "vitepress";

type Lang = "zh-CN" | "en" | "zh-TW";

// 侧边栏翻译
const sidebarTranslations = {
	"zh-CN": {
		docs: "文档",
		quick_start: "快速开始",
		faq: "常见问题",
		plugin_dev: "插件开发",
		plugin_guide: "开发指南",
		plugin_api: "API 参考",
		plugin_best_practices: "最佳实践",
		plugin_format: "包格式规范",
	},
	en: {
		docs: "Docs",
		quick_start: "Quick Start",
		faq: "FAQ",
		plugin_dev: "Plugin Development",
		plugin_guide: "Development Guide",
		plugin_api: "API Reference",
		plugin_best_practices: "Best Practices",
		plugin_format: "Package Format",
	},
	"zh-TW": {
		docs: "文檔",
		quick_start: "快速開始",
		faq: "常見問題",
		plugin_dev: "插件開發",
		plugin_guide: "開發指南",
		plugin_api: "API 參考",
		plugin_best_practices: "最佳實踐",
		plugin_format: "包格式規範",
	},
};

// 获取侧边栏配置
export function docsSidebar(lang: Lang = "zh-CN"): DefaultTheme.SidebarItem[] {
	const t = sidebarTranslations[lang];
	const prefix = lang === "zh-CN" ? "" : `/${lang}`;

	return [
		{
			text: t.docs,
			items: [
				{ text: t.quick_start, link: `${prefix}/docs/quick-start` },
				{ text: t.faq, link: `${prefix}/docs/faq` },
			],
		},
		{
			text: t.plugin_dev,
			items: [
				{
					text: t.plugin_guide,
					link: `${prefix}/docs/plugin/plugin-development-guide`,
				},
				{
					text: t.plugin_api,
					link: `${prefix}/docs/plugin/plugin-api-reference`,
				},
				{
					text: t.plugin_best_practices,
					link: `${prefix}/docs/plugin/plugin-best-practices`,
				},
				{
					text: t.plugin_format,
					link: `${prefix}/docs/plugin/plugin-package-format`,
				},
			],
		},
	];
}

// 获取侧边栏路径
export function getSidebarPath(lang: Lang): string {
	return lang === "zh-CN" ? "/docs/" : `/${lang}/docs/`;
}
