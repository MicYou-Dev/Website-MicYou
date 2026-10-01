import type { DefaultTheme } from "vitepress";

type Lang = "zh-CN" | "en" | "zh-TW";

// 侧边栏翻译
const sidebarTranslations = {
	"zh-CN": {
		docs: "文档",
		quick_start: "快速开始",
		android_compat: "Android 兼容构建",
		faq: "常见问题",
		plugin_system: "插件系统",
		plugin_overview: "总览",
		plugin_user_guide: "用户指南",
		plugin_guide: "开发指南",
		plugin_api: "API 参考",
		plugin_format: "包格式规范",
		plugin_best_practices: "架构与扩展",
		plugin_marketplace: "市场与许可政策",
	},
	en: {
		docs: "Docs",
		quick_start: "Quick Start",
		android_compat: "Android Compat Build",
		faq: "FAQ",
		plugin_system: "Plugin System",
		plugin_overview: "Overview",
		plugin_user_guide: "User Guide",
		plugin_guide: "Development Guide",
		plugin_api: "API Reference",
		plugin_format: "Package Format",
		plugin_best_practices: "Architecture & Extensibility",
		plugin_marketplace: "Marketplace Policy",
	},
	"zh-TW": {
		docs: "文檔",
		quick_start: "快速開始",
		android_compat: "Android 相容構建",
		faq: "常見問題",
		plugin_system: "插件系統",
		plugin_overview: "總覽",
		plugin_user_guide: "使用者指南",
		plugin_guide: "開發指南",
		plugin_api: "API 參考",
		plugin_format: "套件格式規範",
		plugin_best_practices: "架構與擴充",
		plugin_marketplace: "市集與授權政策",
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
				{ text: t.android_compat, link: `${prefix}/docs/android-compat` },
				{ text: t.faq, link: `${prefix}/docs/faq` },
			],
		},
		{
			text: t.plugin_system,
			items: [
				{
					text: t.plugin_overview,
					link: `${prefix}/docs/plugin/plugin-overview`,
				},
				{
					text: t.plugin_user_guide,
					link: `${prefix}/docs/plugin/plugin-user-guide`,
				},
				{
					text: t.plugin_guide,
					link: `${prefix}/docs/plugin/plugin-development-guide`,
				},
				{
					text: t.plugin_api,
					link: `${prefix}/docs/plugin/plugin-api-reference`,
				},
				{
					text: t.plugin_format,
					link: `${prefix}/docs/plugin/plugin-package-format`,
				},
				{
					text: t.plugin_best_practices,
					link: `${prefix}/docs/plugin/plugin-best-practices`,
				},
				{
					text: t.plugin_marketplace,
					link: `${prefix}/docs/plugin/plugin-marketplace-policy`,
				},
			],
		},
	];
}

// 获取侧边栏路径
export function getSidebarPath(lang: Lang): string {
	return lang === "zh-CN" ? "/docs/" : `/${lang}/docs/`;
}
