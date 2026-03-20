import type { FooterData } from "@theojs/lumen";
import type { DefaultTheme } from "vitepress";

// 導航列
export const nav: DefaultTheme.NavItem[] = [
	{
		text: '<iconify-icon class="i-mr" icon="mdi:home" style="color:#e74c3c"></iconify-icon>首頁',
		link: "/zh-TW/",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:file-document" style="color:#3498db"></iconify-icon>文檔',
		link: "/zh-TW/docs/quick-start",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:download" style="color:#20c997"></iconify-icon>下載',
		link: "/zh-TW/download",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:view-list" style="color:#9c27b0"></iconify-icon>更多',
		items: [
			{
				text: '<iconify-icon class="i-mr" icon="mdi:video" style="color:#9c27b0"></iconify-icon>影片',
				link: "/zh-TW/video",
			},
			{
				text: '<iconify-icon class="i-mr" icon="mdi:history" style="color:#ff9800"></iconify-icon>更新日誌',
				link: "/zh-TW/changelog",
			},
		],
	},
];

// 貢獻者組件翻譯
export const contributors = {
	author: "作者",
	contributions: "次貢獻",
	developedWith: "MicYou 用 ❤ 發電",
	thanksContributors: "感謝以下貢獻者,TA們讓 MicYou 變得更好",
};

// 下載組件翻譯
export const download = {
	title: "下載應用",
	viewReleaseNotes: "查看更新日誌",
	windowsDesc: "Windows 10/11 64位元",
	macOSDesc: "macOS 11.0 及以上",
	linuxDesc: "主流 Linux 發行版",
	androidDesc: "Android 8.0 及以上",
	// 檔案名
	installer: "安裝程式",
	portableJRE: "便攜版 (JRE)",
	portableNoJRE: "便攜版 (NoJRE)",
	dmgArm: "DMG (Apple Silicon)",
	dmgIntel: "DMG (Intel)",
	deb: "DEB",
	rpm: "RPM",
	arch: "Arch",
	apk: "APK",
	copied: "已複製",
};

// 頁腳翻譯
export const footer = {
	project: "專案",
	community: "社群",
	support: "支援",
	githubRepo: "GitHub 儲存庫",
	downloadLatest: "下載最新版本",
	feedback: "問題回饋",
	contributing: "貢獻指南",
	telegramChannel: "Telegram 頻道",
	qqGroup: "QQ 群組",
	starProject: "Star 專案",
	sponsor: "贊助開發者",
	mitLicensed: "MIT licensed",
};

// 主題配置
export const themeConfig = {
	editLink: {
		pattern: "https://github.com/LanRhyme/Website-MicYou/edit/master/src/:path",
		text: "在 GitHub 上編輯此頁",
	},
	lastUpdated: {
		text: "最後更新於",
		formatOptions: { dateStyle: "short" as const, timeStyle: "short" as const },
	},
	search: {
		provider: "local" as const,
		options: {
			translations: {
				button: { buttonText: "搜尋文檔", buttonAriaLabel: "搜尋文檔" },
				modal: {
					noResultsText: "無法找到相關結果",
					resetButtonTitle: "清除查詢條件",
					footer: { selectText: "選擇", navigateText: "切換" },
				},
			},
		},
	},
	docFooter: { prev: "上一頁", next: "下一頁" },
	outline: { label: "頁面導航" },
	returnToTopLabel: "返回頂部",
	sidebarMenuLabel: "選單",
	darkModeSwitchLabel: "主題",
	lightModeSwitchTitle: "切換到淺色模式",
	darkModeSwitchTitle: "切換到深色模式",
};

// 頁腳數據
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
						link: "https://github.com/LanRhyme/Website-MicYou/blob/master/CONTRIBUTING_zh-tw.md",
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
		],
	};
}
