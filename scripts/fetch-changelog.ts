/**
 * 从远程服务器下载更新日志，保存到各语言目录
 */

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// 远程 changelog URL
const CHANGELOG_URL = "https://bot.micyou.top/changelog.md?secret=action";

// 各语言的 frontmatter 配置
const FRONTMATTER = {
	"zh-CN": {
		title: "更新日志 - MicYou 版本历史",
		description: "MicYou 更新日志，查看所有版本的新功能、改进和修复内容。",
		keywords: "MicYou更新日志,MicYou版本更新,MicYou新功能,MicYou更新记录",
		aside: false,
	},
	en: {
		title: "Changelog - MicYou Version History",
		description:
			"MicYou changelog with all version updates, new features, improvements and bug fixes.",
		keywords:
			"MicYou changelog,MicYou updates,MicYou new features,MicYou version history",
		aside: false,
	},
	"zh-TW": {
		title: "更新日誌 - MicYou 版本歷史",
		description: "MicYou 更新日誌，查看所有版本的新功能、改進和修復內容。",
		keywords: "MicYou更新日誌,MicYou版本更新,MicYou新功能,MicYou更新記錄",
		aside: false,
	},
};

// 输出文件配置
const OUTPUT_FILES = [
	{
		path: join(ROOT, "src", "changelog.md"),
		lang: "zh-CN" as const,
	},
	{
		path: join(ROOT, "src", "en", "changelog.md"),
		lang: "en" as const,
	},
	{
		path: join(ROOT, "src", "zh-TW", "changelog.md"),
		lang: "zh-TW" as const,
	},
];

/**
 * 生成带 frontmatter 的内容
 */
function generateContent(
	changelog: string,
	lang: keyof typeof FRONTMATTER,
): string {
	const { title, description, keywords, aside } = FRONTMATTER[lang];
	return `---
title: ${title}
description: ${description}
keywords: ${keywords}
aside: ${aside}
---

${changelog}`;
}

async function fetchChangelog(): Promise<string> {
	console.log(`Fetching changelog from: ${CHANGELOG_URL}`);

	const res = await fetch(CHANGELOG_URL);

	if (!res.ok) {
		throw new Error(
			`Failed to fetch changelog: ${res.status} ${res.statusText}`,
		);
	}

	return res.text();
}

/**
 * 检查内容是否有变化
 */
function hasChanges(filePath: string, newContent: string): boolean {
	if (!existsSync(filePath)) {
		return true;
	}

	const existingContent = readFileSync(filePath, "utf-8");
	return existingContent !== newContent;
}

async function main() {
	console.log("Fetching changelog...");

	try {
		const changelog = await fetchChangelog();

		if (!changelog || changelog.trim().length === 0) {
			console.warn("Changelog content is empty, skipping");
			return;
		}

		let hasAnyChanges = false;

		for (const { path, lang } of OUTPUT_FILES) {
			const content = generateContent(changelog, lang);

			if (hasChanges(path, content)) {
				writeFileSync(path, content, "utf-8");
				console.log(`✓ Updated: ${path}`);
				hasAnyChanges = true;
			} else {
				console.log(`✓ No changes: ${path}`);
			}
		}

		if (!hasAnyChanges) {
			console.log("✓ All changelog files are up to date");
		}
	} catch (error) {
		console.error("Failed to fetch changelog:", error);
		process.exit(1);
	}
}

main();
