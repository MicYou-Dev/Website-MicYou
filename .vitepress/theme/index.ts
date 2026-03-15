// https://vitepress.dev/guide/custom-theme

import type { Theme } from "vitepress";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import "@theojs/lumen/style";
import { BoxCube, Card, Footer, Links, Pill } from "@theojs/lumen";
import { getFooterData, type Lang } from "../data/i18n";
import Contributors from "./components/ContributorsCards/Contributors.vue";
import DownloadSection from "./components/DownloadSection/DownloadSection.vue";
import "./style.css";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(DefaultTheme.Layout, null, {
			"layout-bottom": () => {
				// 从 VitePress 获取当前语言
				const { lang } = useData();
				const currentLang = (lang.value || "zh-CN") as Lang;
				const footerData = getFooterData(currentLang);
				return h(Footer, { Footer_Data: footerData });
			},
		});
	},
	enhanceApp({ app }) {
		// 注册 lumen 组件
		app.component("BoxCube", BoxCube);
		app.component("Card", Card);
		app.component("Links", Links);
		app.component("Pill", Pill);
		app.component("Contributors", Contributors);
		app.component("DownloadSection", DownloadSection);
	},
} satisfies Theme;
