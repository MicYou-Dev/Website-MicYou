// https://vitepress.dev/guide/custom-theme
import type { EnhanceAppContext, Theme } from "vitepress";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { h } from "vue";
import "@theojs/lumen/style";
import "@fontsource/noto-sans/latin.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-tc/400.css";
import "@fontsource/noto-sans-tc/700.css";
import {
	BoxCube,
	Card,
	CopyText,
	Footer,
	Links,
	Pill,
	umamiAnalytics,
} from "@theojs/lumen";
import {
	NolebaseEnhancedReadabilitiesMenu,
	NolebaseEnhancedReadabilitiesPlugin,
	NolebaseEnhancedReadabilitiesScreenMenu,
} from "@nolebase/vitepress-plugin-enhanced-readabilities/client";
import { NolebaseGitChangelogPlugin } from "@nolebase/vitepress-plugin-git-changelog/client";
import "@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css";
import "@nolebase/vitepress-plugin-git-changelog/client/style.css";
import {
	enhancedReadabilitiesTranslations,
	getFooterData,
	gitChangelogTranslations,
	type Lang,
} from "../data/i18n.ts";
import Contributors from "./components/ContributorsCards/Contributors.vue";
import ChangelogViewer from "./components/ChangelogViewer/ChangelogViewer.vue";
import DownloadSection from "./components/DownloadSection/DownloadSection.vue";
import UmamiStats from "./components/UmamiStats/UmamiStats.vue";
import "./style.css";
import ThankYou from "./components/ThankYou.vue";
import ViewTrans from "./components/ViewTrans.vue";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(ViewTrans, null, {
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
				return [
					isHome
						? h("div", { class: "nav-stats-center" }, h(UmamiStats))
						: null,
					h(NolebaseEnhancedReadabilitiesMenu),
				];
			},
			"nav-screen-content-after": () => {
				return h(NolebaseEnhancedReadabilitiesScreenMenu);
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
		app.component("Contributors", Contributors);
		app.component("ChangelogViewer", ChangelogViewer);
		app.component("DownloadSection", DownloadSection);
		app.component("UmamiStats", UmamiStats);
		app.component("ThankYou", ThankYou);
		app.component("ViewTrans", ViewTrans);

		// 注册阅读增强与页面历史插件
		app.use(NolebaseEnhancedReadabilitiesPlugin, {
			locales: enhancedReadabilitiesTranslations,
		});
		app.use(NolebaseGitChangelogPlugin, {
			locales: gitChangelogTranslations,
		});

		// 注册 Umami Analytics 插件 - 延迟加载优化 INP
		if (typeof window !== "undefined") {
			// 使用 requestIdleCallback 延迟加载分析脚本
			const loadAnalytics = () => {
				umamiAnalytics({
					id: "0811bb0f-dafa-45bc-9f9b-81506f8d9829",
					src: "https://cloud.umami.is/script.js",
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
