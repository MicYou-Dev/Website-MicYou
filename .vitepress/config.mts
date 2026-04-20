import { figure } from "@mdit/plugin-figure";
import { defineConfig, type HeadConfig } from "vitepress";
import { docsSidebar, getSidebarPath } from "../src/docs/sidebar";
import { navTranslations, themeConfigTranslations } from "./data/i18n";

// SEO 相关常量
const SITE_URL = "https://micyou.top";
const SITE_NAME = "MicYou";
const DEFAULT_DESCRIPTION =
	"将 Android 设备转变为 PC 的高质量麦克风 - 高质量、低延迟、跨平台的音频传输解决方案";
const DEFAULT_KEYWORDS =
	"MicYou,Android麦克风,手机麦克风,电脑麦克风,Wi-Fi麦克风,USB麦克风,蓝牙麦克风,音频传输,跨平台音频";

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
	description: "将 Android 设备转变为 PC 的高质量麦克风",
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

	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["meta", { name: "theme-color", content: "#334355" }],
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
			{ rel: "preconnect", href: "https://umami.micyou.top", crossorigin: "" },
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
				"将 Android 设备转变为 PC 的高质量麦克风 - 高质量、低延迟、跨平台的音频传输解决方案",
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
				"Transform your Android device into a high-quality microphone for PC - High quality, low latency, cross-platform audio transmission solution",
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
				"將 Android 裝置轉變為 PC 的高品質麥克風 - 高品質、低延遲、跨平台的音訊傳輸解決方案",
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
	},
});
