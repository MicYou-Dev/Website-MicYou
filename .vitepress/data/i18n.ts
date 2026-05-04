import type { FooterData } from "@theojs/lumen";
import type { DefaultTheme } from "vitepress";
import * as en from "./lang/en";
import * as zh from "./lang/zh";
import * as zh_tw from "./lang/zh_tw";

export type Lang = "zh-CN" | "en" | "zh-TW";

// 下载组件翻译键类型
export type DownloadKey = keyof typeof zh.download;

// 导航栏
export const navTranslations: Record<Lang, DefaultTheme.NavItem[]> = {
	"zh-CN": zh.nav,
	en: en.nav,
	"zh-TW": zh_tw.nav,
};

// 贡献者组件翻译
export const contributorsTranslations = {
	"zh-CN": zh.contributors,
	en: en.contributors,
	"zh-TW": zh_tw.contributors,
};

// 下载组件翻译
export const downloadTranslations = {
	"zh-CN": zh.download,
	en: en.download,
	"zh-TW": zh_tw.download,
};

// Changelog 组件翻译
export const changelogTranslations = {
	"zh-CN": zh.changelog,
	en: en.changelog,
	"zh-TW": zh_tw.changelog,
};

// Umami 组件翻译
export const umamiTranslations = {
	"zh-CN": zh.umami,
	en: en.umami,
	"zh-TW": zh_tw.umami,
};

// 致谢组件翻译
export const thankYouTranslations = {
	"zh-CN": zh.thankYou,
	en: en.thankYou,
	"zh-TW": zh_tw.thankYou,
};

// 主题配置翻译
export const themeConfigTranslations = {
	"zh-CN": zh.themeConfig,
	en: en.themeConfig,
	"zh-TW": zh_tw.themeConfig,
};

// 根据语言获取页脚数据
export function getFooterData(lang: Lang): FooterData {
	switch (lang) {
		case "en":
			return en.getFooterData();
		case "zh-TW":
			return zh_tw.getFooterData();
		default:
			return zh.getFooterData();
	}
}
