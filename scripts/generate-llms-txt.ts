/**
 * 生成 llms.txt 和 llms-full.txt 文件 - 为 LLM 优化的网站内容索引
 * https://llmstxt.org/
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, "..", "src");
const PUBLIC_DIR = join(SRC_DIR, "public");
const LLMS_TXT_FILE = join(PUBLIC_DIR, "llms.txt");
const LLMS_FULL_TXT_FILE = join(PUBLIC_DIR, "llms-full.txt");

const SITE_URL = "https://micyou.top";
const SITE_NAME = "MicYou";
const SITE_DESCRIPTION =
	"MicYou 将 Android 设备转变为 PC 的高质量麦克风，支持 Wi-Fi、USB 多种连接模式，提供专业音频处理功能。";

interface DocInfo {
	path: string;
	title: string;
	description: string;
	lang: string;
	fullPath: string;
	content: string;
}

const langLabels: Record<string, string> = {
	"zh-CN": "简体中文",
	en: "English",
	"zh-TW": "繁體中文",
};

function extractFrontmatter(content: string): {
	title: string;
	description: string;
} {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return { title: "", description: "" };

	const frontmatter = match[1];
	const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
	const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m);

	return {
		title: titleMatch?.[1]?.replace(/["']/g, "").trim() || "",
		description: descMatch?.[1]?.replace(/["']/g, "").trim() || "",
	};
}

function removeFrontmatter(content: string): string {
	return content.replace(/^---\n[\s\S]*?\n---\n*/, "");
}

function scanMarkdownFiles(
	dir: string,
	baseDir: string,
	lang: string,
): DocInfo[] {
	const results: DocInfo[] = [];

	if (!existsSync(dir)) return results;

	const entries = readdirSync(dir);
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// 跳过语言子目录（en, zh-TW）
			if (lang === "zh-CN" && (entry === "en" || entry === "zh-TW")) continue;
			results.push(...scanMarkdownFiles(fullPath, baseDir, lang));
		} else if (entry.endsWith(".md")) {
			const content = readFileSync(fullPath, "utf-8");
			const { title, description } = extractFrontmatter(content);

			// 跳过没有标题的文件（如首页 layout: home）
			if (!title && content.includes("layout: home")) continue;

			// 计算相对路径
			const relativePath = relative(baseDir, fullPath)
				.replace(/\\/g, "/")
				.replace(/\.md$/, "");

			// 构建URL路径
			let urlPath: string;
			if (lang === "zh-CN") {
				urlPath = `/${relativePath === "index" ? "" : relativePath}`;
			} else {
				urlPath = `/${lang}/${relativePath === "index" ? "" : relativePath}`;
			}

			results.push({
				path: urlPath,
				title: title || entry.replace(".md", ""),
				description,
				lang,
				fullPath,
				content,
			});
		}
	}

	return results;
}

function generateLlmsTxt(docs: DocInfo[]): string {
	const lines: string[] = [];

	// 标题
	lines.push(`# ${SITE_NAME}`);
	lines.push("");
	lines.push(`> ${SITE_DESCRIPTION}`);
	lines.push("");

	// 可选内容块 - 详细描述
	lines.push("## What is MicYou?");
	lines.push("");
	lines.push(
		"MicYou 是一款跨平台音频传输应用，可以将 Android 手机变成电脑的高质量麦克风。",
	);
	lines.push("");
	lines.push("核心功能：");
	lines.push("- 多种连接模式：Wi-Fi、USB (ADB/AOA)");
	lines.push("- 专业音频处理：噪声抑制、自动增益控制 (AGC)、去混响");
	lines.push("- 虚拟麦克风支持：配合 VB-Cable 作为系统麦克风输入");
	lines.push("- 跨平台：支持 Windows、Linux、macOS");
	lines.push("");

	// 文档索引
	lines.push("## Documentation");
	lines.push("");

	for (const [lang, label] of Object.entries(langLabels)) {
		const langDocs = docs.filter((d) => d.lang === lang);
		if (langDocs.length === 0) continue;

		lines.push(`### ${label}`);
		lines.push("");

		for (const doc of langDocs) {
			const fullUrl = `${SITE_URL}${doc.path}`;
			if (doc.description) {
				lines.push(`- [${doc.title}](${fullUrl}): ${doc.description}`);
			} else {
				lines.push(`- [${doc.title}](${fullUrl})`);
			}
		}
		lines.push("");
	}

	// 可选内容块 - 快速开始
	lines.push("## Quick Start");
	lines.push("");
	lines.push("1. 从 GitHub Releases 下载桌面端应用");
	lines.push("2. 下载并安装 Android APK");
	lines.push("3. 确保设备在同一网络（Wi-Fi 模式）或通过 USB 连接");
	lines.push("4. 在两端选择相同的连接模式");
	lines.push("");

	// 可选内容块 - 下载链接
	lines.push("## Downloads");
	lines.push("");
	lines.push(
		`- [GitHub Releases](https://github.com/LanRhyme/MicYou/releases)`,
	);
	lines.push(`- [下载页面](${SITE_URL}/download)`);
	lines.push("");

	// 可选内容块 - 相关链接
	lines.push("## Links");
	lines.push("");
	lines.push(`- [GitHub 仓库](https://github.com/LanRhyme/MicYou)`);
	lines.push(`- [Telegram 频道](https://t.me/MicYouChannel)`);
	lines.push("");

	return lines.join("\n");
}

function generateLlmsFullTxt(docs: DocInfo[]): string {
	const lines: string[] = [];

	// 标题和描述
	lines.push(`# ${SITE_NAME}`);
	lines.push("");
	lines.push(`> ${SITE_DESCRIPTION}`);
	lines.push("");
	lines.push(`URL: ${SITE_URL}`);
	lines.push("");

	// 分隔符
	const separator = "\n---\n";

	// 按语言分组输出文档内容
	for (const [lang, label] of Object.entries(langLabels)) {
		const langDocs = docs.filter((d) => d.lang === lang);
		if (langDocs.length === 0) continue;

		lines.push(separator);
		lines.push(`# ${label}`);
		lines.push("");

		for (const doc of langDocs) {
			lines.push(separator);
			lines.push(`# ${doc.title}`);
			lines.push("");
			lines.push(`URL: ${SITE_URL}${doc.path}`);
			if (doc.description) {
				lines.push(`Description: ${doc.description}`);
			}
			lines.push("");

			// 移除 frontmatter 后的内容
			const cleanContent = removeFrontmatter(doc.content);
			lines.push(cleanContent.trim());
			lines.push("");
		}
	}

	return lines.join("\n");
}

function main() {
	console.log("Generating llms.txt and llms-full.txt...");

	const allDocs: DocInfo[] = [];

	// 扫描中文文档（根目录）
	allDocs.push(...scanMarkdownFiles(SRC_DIR, SRC_DIR, "zh-CN"));

	// 扫描英文文档
	const enDir = join(SRC_DIR, "en");
	allDocs.push(...scanMarkdownFiles(enDir, enDir, "en"));

	// 扫描繁体中文文档
	const zhTwDir = join(SRC_DIR, "zh-TW");
	allDocs.push(...scanMarkdownFiles(zhTwDir, zhTwDir, "zh-TW"));

	// 排序：按语言优先级和路径
	const langOrder: Record<string, number> = { "zh-CN": 0, en: 1, "zh-TW": 2 };
	allDocs.sort((a, b) => {
		const langDiff = (langOrder[a.lang] ?? 99) - (langOrder[b.lang] ?? 99);
		if (langDiff !== 0) return langDiff;
		return a.path.localeCompare(b.path);
	});

	// 确保 public 目录存在
	if (!existsSync(PUBLIC_DIR)) {
		mkdirSync(PUBLIC_DIR, { recursive: true });
	}

	// 生成 llms.txt
	const llmsTxtContent = generateLlmsTxt(allDocs);
	writeFileSync(LLMS_TXT_FILE, llmsTxtContent);
	console.log(`✓ Generated llms.txt with ${allDocs.length} documents`);

	// 生成 llms-full.txt
	const llmsFullTxtContent = generateLlmsFullTxt(allDocs);
	writeFileSync(LLMS_FULL_TXT_FILE, llmsFullTxtContent);
	const sizeKB = (llmsFullTxtContent.length / 1024).toFixed(1);
	console.log(`✓ Generated llms-full.txt (${sizeKB} KB)`);
}

main();
