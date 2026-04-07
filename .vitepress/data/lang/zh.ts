import type { FooterData } from "@theojs/lumen";
import type { DefaultTheme } from "vitepress";

// 导航栏
export const nav: DefaultTheme.NavItem[] = [
	{
		text: '<iconify-icon class="i-mr" icon="mdi:home" style="color:#e74c3c"></iconify-icon>首页',
		link: "/",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:file-document" style="color:#3498db"></iconify-icon>文档',
		link: "/docs/quick-start",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:download" style="color:#20c997"></iconify-icon>下载',
		link: "/download",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:view-list" style="color:#9c27b0"></iconify-icon>更多',
		items: [
			{
				text: '<iconify-icon class="i-mr" icon="mdi:video" style="color:#9c27b0"></iconify-icon>视频',
				link: "/video",
			},
			{
				text: '<iconify-icon class="i-mr" icon="mdi:history" style="color:#ff9800"></iconify-icon>更新日志',
				link: "/changelog",
			},
		],
	},
];

// 贡献者组件翻译
export const contributors = {
	author: "作者",
	contributions: "次贡献",
	developedWith: "MicYou 用 ❤ 发电",
	thanksContributors: "感谢以下贡献者，TA们让 MicYou 变得更好",
};

// 下载组件翻译
export const download = {
	title: "下载应用",
	viewReleaseNotes: "查看更新日志",
	windowsDesc: "Windows 10/11 64位",
	macOSDesc: "macOS 11.0 及以上",
	linuxDesc: "主流 Linux 发行版",
	androidDesc: "Android 8.0 及以上",
	// 文件名
	installer: "安装程序",
	portableJRE: "便携版 (JRE)",
	portableNoJRE: "便携版 (NoJRE)",
	dmgArm: "DMG (Apple Silicon)",
	dmgIntel: "DMG (Intel)",
	deb: "DEB",
	rpm: "RPM",
	arch: "Arch",
	apk: "APK",
	copied: "已复制",
	stable: "稳定版",
	nightly: "快照版",
	nightlyTip: "快照版包含最新功能，可能不稳定",
	mirror: "Mirror 酱高速下载",
};

// Changelog 组件翻译
export const changelog = {
	loading: "加载中...",
	error: "加载失败",
};

// Umami 组件翻译
export const umami = {
	views: "浏览量",
	visits: "访问次数",
	loading: "加载中...",
};

// 页脚翻译
export const footer = {
	project: "项目",
	community: "社区",
	support: "支持",
	llm: "LLM",
	llmTxt: "llms.txt",
	llmFullTxt: "llms-full.txt",
	githubRepo: "GitHub 仓库",
	downloadLatest: "下载最新版本",
	feedback: "问题反馈",
	contributing: "贡献指南",
	telegramChannel: "Telegram 频道",
	qqGroup: "QQ 群",
	starProject: "Star 项目",
	sponsor: "赞助开发者",
	mitLicensed: "MIT licensed",
};

// 主题配置
export const themeConfig = {
	editLink: {
		pattern: "https://github.com/LanRhyme/Website-MicYou/edit/main/src/:path",
		text: "在 GitHub 上编辑此页",
	},
	lastUpdated: {
		text: "最后更新于",
		formatOptions: { dateStyle: "short" as const, timeStyle: "short" as const },
	},
	search: {
		provider: "local" as const,
		options: {
			translations: {
				button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
				modal: {
					noResultsText: "无法找到相关结果",
					resetButtonTitle: "清除查询条件",
					footer: { selectText: "选择", navigateText: "切换" },
				},
			},
		},
	},
	docFooter: { prev: "上一页", next: "下一页" },
	outline: { label: "页面导航" },
	returnToTopLabel: "返回顶部",
	sidebarMenuLabel: "菜单",
	darkModeSwitchLabel: "主题",
	lightModeSwitchTitle: "切换到浅色模式",
	darkModeSwitchTitle: "切换到深色模式",
};

// 页脚数据
export function getFooterData(): FooterData {
	return {
		author: {
			icon: {
				light: "mdi:copyright",
				dark: "mdi:copyright",
				color: { light: "#334355", dark: "#6b8aad" },
			},
			name: "LanRhyme",
			link: "https://github.com/LanRhyme/Website-MicYou/blob/main/LICENSE",
			startYear: 2026,
			text: footer.mitLicensed,
		},
		beian: {
			showIcon: true,
			icp: {
				number: "萌ICP备20261069号",
				link: "https://icp.gov.moe/?keyword=20261069",
				image: "https://icp.gov.moe/images/03.svg",
				target: "_blank",
			},
		},
		group: [
			{
				icon: {
					light: "mdi:github",
					dark: "mdi:github",
					color: { light: "#333", dark: "#fff" },
				},
				title: footer.project,
				links: [
					{
						icon: {
							light: "mdi:source-branch",
							dark: "mdi:source-branch",
							color: { light: "#334355", dark: "#6b8aad" },
						},
						name: footer.githubRepo,
						link: "https://github.com/LanRhyme/MicYou",
						rel: "noopener noreferrer",
					},
					{
						icon: {
							light: "mdi:download",
							dark: "mdi:download",
							color: { light: "#334355", dark: "#6b8aad" },
						},
						name: footer.downloadLatest,
						link: "https://github.com/LanRhyme/MicYou/releases/latest",
						rel: "noopener noreferrer",
					},
					{
						icon: {
							light: "mdi:bug-outline",
							dark: "mdi:bug-outline",
							color: { light: "#e74c3c", dark: "#ff6b6b" },
						},
						name: footer.feedback,
						link: "https://github.com/LanRhyme/MicYou/issues",
						rel: "noopener noreferrer",
					},
					{
						icon: {
							light: "mdi:file-document-outline",
							dark: "mdi:file-document-outline",
							color: { light: "#334355", dark: "#6b8aad" },
						},
						name: footer.contributing,
						link: "https://github.com/LanRhyme/MicYou/blob/master/CONTRIBUTING.md",
						rel: "noopener noreferrer",
					},
				],
			},
			{
				icon: {
					light: "mdi:chat-outline",
					dark: "mdi:chat-outline",
					color: { light: "#334355", dark: "#6b8aad" },
				},
				title: footer.community,
				links: [
					{
						icon: {
							light: "mdi:telegram",
							dark: "mdi:telegram",
							color: { light: "#2CA5E0", dark: "#2CA5E0" },
						},
						name: footer.telegramChannel,
						link: "https://t.me/MicYouChannel",
						rel: "noopener noreferrer",
					},
					{
						icon: {
							light: "mdi:qqchat",
							dark: "mdi:qqchat",
							color: { light: "#12B7F5", dark: "#12B7F5" },
						},
						name: footer.qqGroup,
						link: "https://qm.qq.com/q/V16hPpWPKO",
						rel: "noopener noreferrer",
					},
				],
			},
			{
				icon: {
					light: "mdi:heart-outline",
					dark: "mdi:heart-outline",
					color: { light: "#e74c3c", dark: "#ff6b6b" },
				},
				title: footer.support,
				links: [
					{
						icon: {
							light: "mdi:star-outline",
							dark: "mdi:star-outline",
							color: { light: "#f1c40f", dark: "#f1c40f" },
						},
						name: footer.starProject,
						link: "https://github.com/LanRhyme/MicYou/stargazers",
						rel: "noopener noreferrer",
					},
					{
						icon: {
							light: "mdi:hand-coin-outline",
							dark: "mdi:hand-coin-outline",
							color: { light: "#946ce6", dark: "#946ce6" },
						},
						name: footer.sponsor,
						link: "https://afdian.com/a/LanRhyme",
						rel: "noopener noreferrer sponsored",
					},
				],
			},
			{
				icon: {
					light: "mdi:robot-outline",
					dark: "mdi:robot-outline",
					color: { light: "#334355", dark: "#6b8aad" },
				},
				title: footer.llm,
				links: [
					{
						icon: {
							light: "mdi:file-document-outline",
							dark: "mdi:file-document-outline",
							color: { light: "#334355", dark: "#6b8aad" },
						},
						name: footer.llmTxt,
						link: "/llms.txt",
					},
					{
						icon: {
							light: "mdi:file-document-multiple-outline",
							dark: "mdi:file-document-multiple-outline",
							color: { light: "#334355", dark: "#6b8aad" },
						},
						name: footer.llmFullTxt,
						link: "/llms-full.txt",
					},
				],
			},
		],
	};
}
