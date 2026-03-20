// https://vitepress.dev/guide/custom-theme
import type { EnhanceAppContext, Theme } from "vitepress";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import "@theojs/lumen/style";
import {
	BoxCube,
	Card,
	CopyText,
	Footer,
	Links,
	Pill,
	umamiAnalytics,
} from "@theojs/lumen";
import { getFooterData, type Lang } from "../data/i18n";
import ChangelogList from "./components/ChangelogList/ChangelogList.vue";
import Contributors from "./components/ContributorsCards/Contributors.vue";
import DownloadSection from "./components/DownloadSection/DownloadSection.vue";
import UmamiStats from "./components/UmamiStats/UmamiStats.vue";
import "./style.css";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(DefaultTheme.Layout, null, {
			"layout-top": () => {
				const { lang } = useData();
				const skipText: Record<string, string> = {
					"zh-CN": "跳转到主要内容",
					en: "Skip to main content",
					"zh-TW": "跳轉到主要內容",
				};
				return h(
					"a",
					{
						href: "#VPContent",
						class: "skip-to-content",
					},
					skipText[lang.value] || skipText["zh-CN"],
				);
			},
			"nav-bar-content-after": () => {
				const { frontmatter } = useData();
				// 只在首页显示统计
				const isHome = frontmatter.value.layout === "home";
				return isHome
					? h("div", { class: "nav-stats-center" }, h(UmamiStats))
					: null;
			},
			"layout-bottom": () => {
				// 从 VitePress 获取当前语言
				const { lang } = useData();
				const currentLang = (lang.value || "zh-CN") as Lang;
				const footerData = getFooterData(currentLang);
				return h(Footer, { Footer_Data: footerData });
			},
		});
	},
	enhanceApp: ({ app }: EnhanceAppContext) => {
		// 注册 lumen 组件
		app.component("BoxCube", BoxCube);
		app.component("Card", Card);
		app.component("Links", Links);
		app.component("Pill", Pill);
		app.component("Copy", CopyText);
		app.component("ChangelogList", ChangelogList);
		app.component("Contributors", Contributors);
		app.component("DownloadSection", DownloadSection);
		app.component("UmamiStats", UmamiStats);
		// 注册 Umami Analytics 插件 - 延迟加载优化 INP
		if (typeof window !== "undefined") {
			// 使用 requestIdleCallback 延迟加载分析脚本
			const loadAnalytics = () => {
				umamiAnalytics({
					id: "7f5e889c-6a31-4074-95b7-78d52bb559ce",
					src: "https://umami.micyou.top/script.js",
				});
			};
			if ("requestIdleCallback" in window) {
				requestIdleCallback(loadAnalytics, { timeout: 2000 });
			} else {
				setTimeout(loadAnalytics, 100);
			}
		}
	},
} satisfies Theme;
