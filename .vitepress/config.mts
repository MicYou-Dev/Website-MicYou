import { figure } from "@mdit/plugin-figure";
import {
	GitChangelog,
	GitChangelogMarkdownSection,
} from "@nolebase/vitepress-plugin-git-changelog/vite";
import { defineConfig, type HeadConfig } from "vitepress";
import { docsSidebar, getSidebarPath } from "../src/docs/sidebar.ts";
import {
	navTranslations,
	searchTranslations,
	themeConfigTranslations,
} from "./data/i18n.ts";

// SEO 相关常量
const SITE_URL = "https://micyou.top";
const SITE_NAME = "MicYou";
const DEFAULT_DESCRIPTION =
	"把手机变成电脑麦克风。支持 Wi-Fi、USB 与 Web 网页连接，低延迟音频传输，内置 AI 降噪与回声消除。";
const DEFAULT_KEYWORDS =
	"MicYou,手机麦克风,电脑麦克风,Android麦克风,无线麦克风,USB麦克风,Wi-Fi麦克风,Web麦克风,音频传输,降噪,低延迟";

// JSON-LD 结构化数据
const jsonLdWebSite = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: SITE_NAME,
	url: SITE_URL,
	description: DEFAULT_DESCRIPTION,
	potentialAction: {
		"@type": "SearchAction",
		target: `${SITE_URL}/search?q={search_term_string}`,
		"query-input": "required name=search_term_string",
	},
};

const jsonLdSoftwareApp = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: SITE_NAME,
	applicationCategory: "MultimediaApplication",
	operatingSystem: ["Windows", "macOS", "Linux", "Android"],
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
	},
	description: DEFAULT_DESCRIPTION,
	url: SITE_URL,
	downloadUrl: `${SITE_URL}/download`,
	softwareVersion: "Latest",
	aggregateRating: {
		"@type": "AggregateRating",
		ratingValue: "4.8",
		ratingCount: "100",
	},
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "./src",
	title: "MicYou",
	description: "把手机变成电脑麦克风",
	cleanUrls: true,
	sitemap: {
		hostname: SITE_URL,
	},

	markdown: {
		lineNumbers: true,
		image: { lazyLoading: true },
		config: (md) => {
			md.use(figure);
		},
	},

	// 支持 iconify-icon 组件
	vue: {
		template: {
			compilerOptions: { isCustomElement: (tag) => tag === "iconify-icon" },
		},
	},

	vite: {
		plugins: [
			GitChangelog({
				repoURL: () => "https://github.com/LanRhyme/Website-MicYou",
				mapAuthors: [
					{
						name: "ChouChiu",
						username: "ChouChiu",
						mapByNameAliases: ["WingChunWong", "Wong Wing Chun"],
						mapByEmailAliases: [
							"huangrongjun2200@outlook.com",
							"lshengevery@gmail.com",
						],
					},
					{
						name: "LanRhyme",
						username: "LanRhyme",
						mapByNameAliases: ["LanRhyme", "lanrhyme"],
						mapByEmailAliases: [
							"xiao_ren233@foxmail.com",
							"lanrhyme@users.noreply.github.com",
							"113491998+LanRhyme@users.noreply.github.com",
						],
					},
					{
						name: "OrientCOMPASS",
						username: "OrientCOMPASS",
						mapByNameAliases: ["OrientCOMPASS"],
						mapByEmailAliases: [
							"316423573+OrientCOMPASS@users.noreply.github.com",
						],
					},
					{
						name: "luminset",
						username: "luminset",
						mapByNameAliases: ["luminset"],
						mapByEmailAliases: [
							"2272826959@qq.com",
							"41487531+luminset@users.noreply.github.com",
						],
					},
					{
						name: "Damon Lu",
						username: "WhatDamon",
						mapByNameAliases: ["Damon Lu", "Damon  Lu", "WhatDamon"],
						mapByEmailAliases: ["59256766+WhatDamon@users.noreply.github.com"],
					},
					{
						name: "raindropQWQ",
						username: "raindropQWQ",
						mapByNameAliases: ["raindropQWQ", "raindropQwQ", "snowdropQwQ"],
						mapByEmailAliases: [
							"102001942+raindropQWQ@users.noreply.github.com",
							"85062843+snowdropQwQ@users.noreply.github.com",
						],
					},
					{
						name: "ChinsaaWei",
						username: "ChinsaaWei",
						mapByNameAliases: ["ChinsaaWei"],
						mapByEmailAliases: ["chinsaa@163.com"],
					},
				],
			}),
			GitChangelogMarkdownSection({
				exclude: (id) => !id.includes("/docs/"),
				sections: {
					disableChangelog: false,
					disableContributors: false,
				},
			}),
		],
		optimizeDeps: {
			exclude: [
				"@nolebase/vitepress-plugin-enhanced-readabilities/client",
				"@nolebase/vitepress-plugin-git-changelog/client",
				"@nolebase/ui",
			],
		},
		ssr: {
			noExternal: [
				"@nolebase/vitepress-plugin-enhanced-readabilities",
				"@nolebase/vitepress-plugin-git-changelog",
				"@nolebase/ui",
			],
		},
	},

	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["meta", { name: "theme-color", content: "#021f4d" }],
		// SEO 基础标签
		["meta", { name: "author", content: "LanRhyme" }],
		["meta", { name: "keywords", content: DEFAULT_KEYWORDS }],
		["meta", { name: "robots", content: "index, follow" }],
		["meta", { name: "googlebot", content: "index, follow" }],
		// JSON-LD 结构化数据
		["script", { type: "application/ld+json" }, JSON.stringify(jsonLdWebSite)],
		[
			"script",
			{ type: "application/ld+json" },
			JSON.stringify(jsonLdSoftwareApp),
		],
		// 预加载关键资源 - 优化 LCP
		[
			"link",
			{
				rel: "preload",
				href: "/favicon.ico",
				as: "image",
				fetchpriority: "high",
			},
		],
		// 预连接优化 - 减少外部资源连接延迟
		[
			"link",
			{ rel: "preconnect", href: "https://api.github.com", crossorigin: "" },
		],
		[
			"link",
			{
				rel: "preconnect",
				href: "https://api.iconify.design",
				crossorigin: "",
			},
		],
		[
			"link",
			{ rel: "preconnect", href: "https://cloud.umami.is", crossorigin: "" },
		],
		[
			"link",
			{
				rel: "preconnect",
				href: "https://api-gateway.umami.dev",
				crossorigin: "",
			},
		],
		[
			"link",
			{ rel: "dns-prefetch", href: "https://avatars.githubusercontent.com" },
		],
		["link", { rel: "dns-prefetch", href: "https://github.com" }],
		// 字体显示优化 - 防止 FOUT/CLS
		[
			"style",
			{},
			`@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;}`,
		],
		// 无障碍优化
		["meta", { name: "format-detection", content: "telephone=no" }],
		["meta", { name: "mobile-web-app-capable", content: "yes" }],
		["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
		[
			"meta",
			{ name: "apple-mobile-web-app-status-bar-style", content: "default" },
		],
	],

	// 动态生成 SEO 标签
	transformPageData(pageData) {
		const pagePath = pageData.relativePath
			.replace(/\.md$/, "")
			.replace(/\/index$/, "/");
		const canonicalUrl = `${SITE_URL}/${pagePath}`;
		const ogImage = pageData.frontmatter.ogImage || "/app_icon.png";
		const pageKeywords = pageData.frontmatter.keywords || DEFAULT_KEYWORDS;

		// 确定当前语言和路径
		let langCode = "zh-CN";
		let langPath = pagePath;
		if (pagePath.startsWith("en/")) {
			langCode = "en";
			langPath = pagePath.replace("en/", "");
		} else if (pagePath.startsWith("zh-TW/")) {
			langCode = "zh-TW";
			langPath = pagePath.replace("zh-TW/", "");
		}

		// 生成 hreflang 标签
		const hreflangLinks: HeadConfig[] = [
			[
				"link",
				{
					rel: "alternate",
					hreflang: "zh-CN",
					href: `${SITE_URL}/${langPath}`,
				},
			],
			[
				"link",
				{
					rel: "alternate",
					hreflang: "en",
					href: `${SITE_URL}/en/${langPath}`,
				},
			],
			[
				"link",
				{
					rel: "alternate",
					hreflang: "zh-TW",
					href: `${SITE_URL}/zh-TW/${langPath}`,
				},
			],
			[
				"link",
				{
					rel: "alternate",
					hreflang: "x-default",
					href: `${SITE_URL}/${langPath}`,
				},
			],
		];

		const head: HeadConfig[] = [
			// Open Graph 标签
			["meta", { property: "og:type", content: "website" }],
			["meta", { property: "og:site_name", content: SITE_NAME }],
			["meta", { property: "og:locale", content: langCode }],
			["meta", { property: "og:title", content: pageData.title || SITE_NAME }],
			[
				"meta",
				{
					property: "og:description",
					content: pageData.description || DEFAULT_DESCRIPTION,
				},
			],
			["meta", { property: "og:url", content: canonicalUrl }],
			["meta", { property: "og:image", content: `${SITE_URL}${ogImage}` }],
			["meta", { property: "og:image:width", content: "1200" }],
			["meta", { property: "og:image:height", content: "630" }],
			// Twitter Card 标签
			["meta", { name: "twitter:card", content: "summary_large_image" }],
			["meta", { name: "twitter:site", content: "@MicYouApp" }],
			["meta", { name: "twitter:title", content: pageData.title || SITE_NAME }],
			[
				"meta",
				{
					name: "twitter:description",
					content: pageData.description || DEFAULT_DESCRIPTION,
				},
			],
			["meta", { name: "twitter:image", content: `${SITE_URL}${ogImage}` }],
			// SEO 标签
			["meta", { name: "keywords", content: pageKeywords }],
			["link", { rel: "canonical", href: canonicalUrl }],
			...hreflangLinks,
		];

		pageData.frontmatter.head ??= [];
		pageData.frontmatter.head.push(...head);
	},

	locales: {
		root: {
			label: "简体中文",
			lang: "zh-CN",
			title: "MicYou",
			description:
				"把手机变成电脑麦克风。支持 Wi-Fi、USB 与 Web 网页连接，低延迟音频传输，内置 AI 降噪与回声消除。",
			themeConfig: {
				nav: navTranslations["zh-CN"],
				sidebar: { [getSidebarPath("zh-CN")]: docsSidebar("zh-CN") },
				...themeConfigTranslations["zh-CN"],
			},
		},
		en: {
			label: "English",
			lang: "en",
			title: "MicYou",
			description:
				"Turn your phone into a PC microphone. Supports Wi-Fi, USB, and Web streaming with low latency, AI noise reduction, and echo cancellation.",
			themeConfig: {
				nav: navTranslations.en,
				sidebar: { [getSidebarPath("en")]: docsSidebar("en") },
				...themeConfigTranslations.en,
			},
		},
		"zh-TW": {
			label: "繁體中文",
			lang: "zh-TW",
			title: "MicYou",
			description:
				"把手機變成電腦麥克風。支援 Wi-Fi、USB 與 Web 網頁連線，低延遲音訊傳輸，內建 AI 降噪與回聲消除。",
			themeConfig: {
				nav: navTranslations["zh-TW"],
				sidebar: { [getSidebarPath("zh-TW")]: docsSidebar("zh-TW") },
				...themeConfigTranslations["zh-TW"],
			},
		},
	},

	themeConfig: {
		logo: "/app_icon.png",
		socialLinks: [
			{ icon: "github", link: "https://github.com/LanRhyme/MicYou" },
			{ icon: "telegram", link: "https://t.me/MicYouChannel" },
		],
		search: {
			provider: "local",
			options: {
				locales: {
					root: {
						translations: searchTranslations["zh-CN"],
					},
					en: {
						translations: searchTranslations.en,
					},
					"zh-TW": {
						translations: searchTranslations["zh-TW"],
					},
				},
			},
		},
	},
});
