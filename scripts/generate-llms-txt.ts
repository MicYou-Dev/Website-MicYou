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
	"把手机变成电脑麦克风。支持 Wi-Fi、USB 与 Web 网页连接，低延迟音频传输，内置 AI 降噪与回声消除。";

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

interface Frontmatter {
	title: string;
	description: string;
}

function extractFrontmatter(content: string): Frontmatter {
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
		"MicYou 是一款跨平台的音频串流工具，支持将手机变成电脑的高音质低延迟麦克风。",
	);
	lines.push("");
	lines.push("核心特性：");
	lines.push(
		"- 多种连接方式：Wi-Fi 局域网、USB (ADB) 数据线直连与 Web 网页免安装扫码连接",
	);
	lines.push(
		"- 专业音频处理：内置 PureVox AI 降噪、AEC 回声消除、去混响、均衡器与自动增益 (AGC)",
	);
	lines.push(
		"- 虚拟麦克风支持：原生适配 Windows (VB-CABLE)、macOS (BlackHole) 与 Linux (PipeWire)",
	);
	lines.push(
		"- 全平台支持：覆盖 Windows、macOS 与 Linux，支持精美 GUI、轻量 CLI 与终端 TUI",
	);
	lines.push("- 插件生态：支持 Native 与 WebAssembly 插件扩展及插件市场");
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
	lines.push(
		"1. 从 GitHub Releases 下载桌面端应用与 Android APK（或使用免安装的 Web 模式）",
	);
	lines.push(
		"2. 配置系统虚拟麦克风（Windows: VB-CABLE，macOS: BlackHole，Linux: PipeWire）",
	);
	lines.push("3. 选择连接模式（Wi-Fi、USB 或 Web 模式）开始音频推流");
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
