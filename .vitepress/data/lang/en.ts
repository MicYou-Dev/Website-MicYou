import type { FooterData } from "@theojs/lumen";
import type { DefaultTheme } from "vitepress";

// Navigation
export const nav: DefaultTheme.NavItem[] = [
	{
		text: '<iconify-icon class="i-mr" icon="mdi:home" style="color:#e74c3c"></iconify-icon>Home',
		link: "/en/",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:file-document" style="color:#3498db"></iconify-icon>Docs',
		link: "/en/docs/quick-start",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:download" style="color:#20c997"></iconify-icon>Download',
		link: "/en/download",
	},
	{
		text: '<iconify-icon class="i-mr" icon="mdi:view-list" style="color:#9c27b0"></iconify-icon>More',
		items: [
			{
				text: '<iconify-icon class="i-mr" icon="mdi:video" style="color:#9c27b0"></iconify-icon>Videos',
				link: "/en/video",
			},
			{
				text: '<iconify-icon class="i-mr" icon="mdi:history" style="color:#ff9800"></iconify-icon>Changelog',
				link: "/en/changelog",
			},
		],
	},
];

// Contributors component translations
export const contributors = {
	author: "Author",
	contributions: "contributions",
	developedWith: "MicYou made by ❤",
	thanksContributors: "Thanks to our contributors, who make MicYou better",
};

// Download component translations
export const download = {
	title: "Download",
	viewReleaseNotes: "View release notes",
	windowsDesc: "Windows 10/11 64-bit",
	macOSDesc: "macOS 11.0 and later",
	linuxDesc: "Major Linux distributions",
	androidDesc: "Android 8.0 and later",
	// File names
	installer: "Installer",
	portableJRE: "Portable (JRE)",
	portableNoJRE: "Portable (NoJRE)",
	dmgArm: "DMG (Apple Silicon)",
	dmgIntel: "DMG (Intel)",
	deb: "DEB",
	rpm: "RPM",
	arch: "Arch",
	apk: "APK",
	copied: "Copied",
	// Download source
	sourceGithub: "GitHub",
	sourceMirror: "Mirror",
	mirrorTip: "Mirror recommended for users in China Mainland",
	// Version type
	stable: "Stable",
	nightly: "Nightly",
	nightlyTip: "Nightly includes latest features, may be unstable",
};

// Changelog component translations
export const changelog = {
	loading: "Loading...",
	error: "Failed to load",
};

// Umami component translations
export const umami = {
	views: "Views",
	visits: "Visits",
	loading: "Loading...",
};

// Footer translations
export const footer = {
	project: "Project",
	community: "Community",
	support: "Support",
	llm: "LLM",
	llmTxt: "llms.txt",
	llmFullTxt: "llms-full.txt",
	githubRepo: "GitHub Repository",
	downloadLatest: "Download Latest",
	feedback: "Report Issue",
	contributing: "Contributing Guide",
	telegramChannel: "Telegram Channel",
	qqGroup: "QQ Group",
	starProject: "Star Project",
	sponsor: "Sponsor Developer",
	mitLicensed: "MIT licensed",
};

// Theme config
export const themeConfig = {
	editLink: {
		pattern: "https://github.com/LanRhyme/Website-MicYou/edit/master/src/:path",
		text: "Edit this page on GitHub",
	},
	lastUpdated: {
		text: "Last updated",
		formatOptions: { dateStyle: "short" as const, timeStyle: "short" as const },
	},
	search: {
		provider: "local" as const,
		options: {
			translations: {
				button: { buttonText: "Search", buttonAriaLabel: "Search" },
				modal: {
					noResultsText: "No results found",
					resetButtonTitle: "Clear search query",
					footer: { selectText: "Select", navigateText: "Navigate" },
				},
			},
		},
	},
	docFooter: { prev: "Previous", next: "Next" },
	outline: { label: "On this page" },
	returnToTopLabel: "Return to top",
	sidebarMenuLabel: "Menu",
	darkModeSwitchLabel: "Theme",
	lightModeSwitchTitle: "Switch to light mode",
	darkModeSwitchTitle: "Switch to dark mode",
};

// Footer data
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
						link: "https://github.com/LanRhyme/Website-MicYou",
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
