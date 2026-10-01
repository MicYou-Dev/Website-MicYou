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
			{
				text: '<iconify-icon class="i-mr" icon="mdi:heart" style="color:#e74c3c"></iconify-icon>贊助',
				link: "https://afdian.com/a/LanRhyme",
			},
		],
	},
];

// 貢獻者組件翻譯
export const contributors = {
	author: "作者",
	maintainer: "維護者",
	contributions: "次貢獻",
	developedWith: "MicYou 用 ❤ 發電",
	thanksContributors: "感謝所有貢獻者，讓 MicYou 變得更好",
	sponsorTitle: "贊助與支持",
	sponsorDesc:
		"如果您覺得 MicYou 對您有幫助，歡迎前往愛發電支持開發者，感謝每一份認可與陪伴！",
	sponsorBtn: "前往愛發電支持",
};

// 下載組件翻譯
export const download = {
	title: "下載 MicYou",
	viewReleaseNotes: "查看更新日誌",
	windowsDesc: "Windows 10 / 11 (64 位元)",
	macOSDesc: "macOS 11.0 及以上 (Apple Silicon)",
	linuxDesc: "主流 Linux 發行版 (x86_64)",
	androidDesc: "Android 7.0 及以上（提供 5.0+ 相容版）",
	// 檔案名
	installer: "安裝套件 (.exe)",
	appImage: "AppImage",
	deb: "DEB",
	rpm: "RPM",
	arch: "Arch Linux",
	dmgArm: "DMG (Apple Silicon)",
	apk: "APK 安裝套件",
	copied: "已複製",
	stable: "穩定版",
	nightly: "預覽版 (Nightly)",
	nightlyTip: "包含最新開發特性，可能不夠穩定",
	mirror: "Mirror 醬高速下載",
	mirrorHernet: "河南教育科研網鏡像",
	mirrorCqu: "重慶大學鏡像",
	mirrorWarning: "請勿使用多線程下載器，避免 IP 被限速或封禁",
};

// Changelog 組件翻譯
export const changelog = {
	loading: "載入中...",
	error: "載入失敗",
};

// Umami 組件翻譯
export const umami = {
	views: "瀏覽量",
	visits: "造訪次數",
	loading: "載入中...",
};

// 致謝組件翻譯
export const thankYou = {
	title: "特別致謝",
	hernetName: "河南省教育科研網開源軟體鏡像站",
	hernetDesc: "感謝 河南省教育科研網開源軟體鏡像站 為本專案提供鏡像下載支援",
	cquName: "重慶大學開源軟體鏡像站",
	cquDesc: "感謝 重慶大學開源軟體鏡像站 提供的長期穩定支援",
	mirrorName: "Mirror 醬",
	mirrorDesc: "感謝 Mirror 醬 為本專案提供高速鏡像下載加速",
};

// 頁腳翻譯
export const footer = {
	project: "專案",
	community: "社群",
	support: "支援",
	llm: "LLM",
	llmTxt: "llms.txt",
	llmFullTxt: "llms-full.txt",
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
		pattern: "https://github.com/LanRhyme/Website-MicYou/edit/main/src/:path",
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
				button: { buttonText: "搜尋文件", buttonAriaLabel: "搜尋文件" },
				modal: {
					displayDetails: "顯示詳細列表",
					resetButtonTitle: "清除查詢條件",
					backButtonTitle: "關閉搜尋",
					noResultsText: "無法找到相關結果",
					footer: {
						selectText: "選擇",
						selectKeyAriaLabel: "Enter",
						navigateText: "切換",
						navigateUpKeyAriaLabel: "上箭頭",
						navigateDownKeyAriaLabel: "下箭頭",
						closeText: "關閉",
						closeKeyAriaLabel: "esc",
					},
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
						rel: "noopener noreferrer",
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

// 閱讀增強翻譯
export const enhancedReadabilities = {
	title: { title: "閱讀增強", titleAriaLabel: "閱讀增強" },
	layoutSwitch: {
		title: "版面配置切換",
		titleAriaLabel: "版面配置切換",
		titleHelpMessage:
			"調整 VitePress 的版面樣式，以適配不同的閱讀習慣和螢幕環境。",
		titleScreenNavWarningMessage: "行動裝置暫無可切換版面。",
		optionFullWidth: "全部展開",
		optionFullWidthAriaLabel: "全部展開",
		optionFullWidthHelpMessage: "使側邊欄和內容區域佔據整個螢幕的全部寬度。",
		optionSidebarWidthAdjustableOnly: "全部展開，但側邊欄寬度可調",
		optionSidebarWidthAdjustableOnlyAriaLabel: "全部展開，但側邊欄寬度可調",
		optionSidebarWidthAdjustableOnlyHelpMessage:
			"側邊欄寬度可調，但內容區域寬度不變，調整後的側邊欄將可以佔據整個螢幕的最大寬度。",
		optionBothWidthAdjustable: "全部展開，且側邊欄和內容區域寬度均可調",
		optionBothWidthAdjustableAriaLabel:
			"全部展開，且側邊欄和內容區域寬度均可調",
		optionBothWidthAdjustableHelpMessage:
			"側邊欄和內容區域寬度均可調，調整後的側邊欄和內容區域將可以佔據整個螢幕的最大寬度。",
		optionOriginalWidth: "原始寬度",
		optionOriginalWidthAriaLabel: "原始寬度",
		optionOriginalWidthHelpMessage: "原始的 VitePress 預設版面寬度",
		contentLayoutMaxWidth: {
			title: "內容最大寬度",
			titleAriaLabel: "內容最大寬度",
			titleHelpMessage:
				"調整 VitePress 版面中內容區域的寬度，以適配不同的閱讀習慣和螢幕環境。",
			titleScreenNavWarningMessage: "行動裝置暫不支援調整內容最大寬度。",
			slider: "調整內容最大寬度",
			sliderAriaLabel: "調整內容最大寬度",
			sliderHelpMessage: "一個可調整的滑塊，用於選擇和自訂內容最大寬度。",
		},
		pageLayoutMaxWidth: {
			title: "頁面最大寬度",
			titleAriaLabel: "頁面最大寬度",
			titleHelpMessage:
				"調整 VitePress 版面中頁面的寬度，以適配不同的閱讀習慣和螢幕環境。",
			titleScreenNavWarningMessage: "行動裝置暫不支援調整頁面最大寬度。",
			slider: "調整頁面最大寬度",
			sliderAriaLabel: "調整頁面最大寬度",
			sliderHelpMessage: "一個可調整的滑塊，用於選擇和自訂頁面最大寬度。",
		},
	},
	spotlight: {
		title: "聚光燈",
		titleAriaLabel: "聚光燈",
		titleHelpMessage:
			"支援在內文中醒目提示目前滑鼠懸停的行和元素，以最佳化閱讀和專注困難使用者的閱讀體驗。",
		titleScreenNavWarningMessage: "行動裝置暫不支援聚光燈。",
		optionOn: "開啟",
		optionOnAriaLabel: "開啟",
		optionOnHelpMessage: "開啟聚光燈。",
		optionOff: "關閉",
		optionOffAriaLabel: "關閉",
		optionOffHelpMessage: "關閉聚光燈。",
		styles: {
			title: "聚光燈樣式",
			titleAriaLabel: "聚光燈樣式",
			titleHelpMessage: "調整聚光燈的樣式。",
			titleScreenNavWarningMessage: "行動裝置暫不支援調整聚光燈樣式。",
			optionUnder: "置於底部",
			optionUnderAriaLabel: "置於底部",
			optionUnderHelpMessage:
				"在目前滑鼠懸停的元素下方新增一個純色背景以醒目提示目前滑鼠懸停的位置。",
			optionAside: "置於側邊",
			optionAsideAriaLabel: "置於側邊",
			optionAsideHelpMessage:
				"在目前滑鼠懸停的元素旁邊新增一條固定的純色線以醒目提示目前滑鼠懸停的位置。",
		},
	},
};

// 頁面歷史與貢獻者翻譯
export const gitChangelog = {
	changelog: {
		title: "頁面歷史",
		noData: "暫無最近變更歷史",
		lastEdited: "最後編輯於 {{daysAgo}}",
		lastEditedDateFnsLocaleName: "zhTW",
		viewFullHistory: "查看完整歷史",
		committedOn: " 於 {{date}}",
	},
	contributors: {
		title: "貢獻者",
		noData: "暫無相關貢獻者",
	},
};
