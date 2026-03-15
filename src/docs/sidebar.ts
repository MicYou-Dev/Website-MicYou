import type { DefaultTheme } from "vitepress";

type Lang = "zh-CN" | "en" | "zh-TW";

// 侧边栏翻译
const sidebarTranslations = {
	"zh-CN": {
		docs: "文档",
		quick_start: "快速开始",
		faq: "常见问题",
	},
	en: {
		docs: "Docs",
		quick_start: "Quick Start",
		faq: "FAQ",
	},
	"zh-TW": {
		docs: "文檔",
		quick_start: "快速開始",
		faq: "常見問題",
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
	];
}

// 获取侧边栏路径
export function getSidebarPath(lang: Lang): string {
	return lang === "zh-CN" ? "/docs/" : `/${lang}/docs/`;
}
