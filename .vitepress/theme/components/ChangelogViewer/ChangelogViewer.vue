<script setup lang="ts">
import { useData } from "vitepress";
import { computed, onMounted, ref } from "vue";
import { marked, type Tokens } from "marked";
import { changelogTranslations, type Lang } from "../../../data/i18n";

interface GitHubLinkToken extends Tokens.Generic {
	type: "githubLink";
	href: string;
	text: string;
	isCode?: boolean;
}

interface MentionToken extends Tokens.Generic {
	type: "mention";
	username: string;
}

const { lang } = useData();
const t = computed(
	() =>
		changelogTranslations[lang.value as Lang] || changelogTranslations["zh-CN"],
);

const changelog = ref("");
const loading = ref(true);
const error = ref<string | null>(null);

const CHANGELOG_URL = "https://bot.micyou.top/changelog.md";
const CACHE_KEY = "micyou-changelog";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 小时

// 缓存操作
const getCache = (): { content: string; timestamp: number } | null => {
	try {
		return JSON.parse(localStorage.getItem(CACHE_KEY) || "");
	} catch {
		return null;
	}
};

const setCache = (content: string) => {
	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ content, timestamp: Date.now() }),
		);
	} catch {
		/* ignore */
	}
};

const isCacheValid = (cache: ReturnType<typeof getCache>) =>
	cache && Date.now() - cache.timestamp < CACHE_DURATION;

// GitHub 链接处理：PR/Issue 链接和 @username 提及
let extensionsRegistered = false;
const githubExtensions = [
	{
		name: "githubLink",
		level: "inline" as const,
		start: (src: string) => src.indexOf("https://github.com"),
		tokenizer(src: string) {
			const match = src.match(
				/^(https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/(pull|issues|compare)\/[^\s]+)/,
			);
			if (!match) return undefined;
			const [, href, type] = match;
			// PR/Issue: 提取编号
			const numMatch = href.match(/\/(pull|issues)\/(\d+)$/);
			if (numMatch) {
				return {
					type: "githubLink",
					raw: match[0],
					href,
					text: `#${numMatch[2]}`,
				};
			}
			// Compare: 提取版本
			const cmpMatch = href.match(/\/compare\/(.+)$/);
			if (cmpMatch) {
				return {
					type: "githubLink",
					raw: match[0],
					href,
					text: cmpMatch[1],
					isCode: true,
				};
			}
			return { type: "githubLink", raw: match[0], href, text: href };
		},
		renderer(token: Tokens.Generic) {
			const t = token as GitHubLinkToken;
			const content = t.isCode ? `<code>${t.text}</code>` : t.text;
			return `<a href="${t.href}" target="_blank" rel="noopener noreferrer">${content}</a>`;
		},
	},
	{
		name: "mention",
		level: "inline" as const,
		start: (src: string) => src.indexOf("@"),
		tokenizer(src: string) {
			const match = src.match(/^@([a-zA-Z0-9_-]+)/);
			return match
				? { type: "mention", raw: match[0], username: match[1] }
				: undefined;
		},
		renderer(token: Tokens.Generic) {
			const t = token as MentionToken;
			return `<a href="https://github.com/${t.username}" target="_blank" rel="noopener noreferrer">@${t.username}</a>`;
		},
	},
];

if (!extensionsRegistered) {
	marked.use({ extensions: githubExtensions });
	extensionsRegistered = true;
}

const renderedContent = computed(() =>
	changelog.value
		? marked.parse(changelog.value, { gfm: true, breaks: true })
		: "",
);

onMounted(async () => {
	const cache = getCache();
	if (cache && isCacheValid(cache)) {
		changelog.value = cache.content;
		loading.value = false;
		return;
	}

	try {
		const res = await fetch(`${CHANGELOG_URL}?t=${Date.now()}`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const content = await res.text();
		changelog.value = content;
		setCache(content);
	} catch (e) {
		if (cache) changelog.value = cache.content;
		else error.value = e instanceof Error ? e.message : String(e);
	} finally {
		loading.value = false;
	}
});
</script>

<template>
  <div class="changelog-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="state">
      <iconify-icon icon="mdi:loading" class="spin" />
      <span>{{ t.loading }}</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state error">
      <iconify-icon icon="mdi:alert-circle-outline" />
      <span>{{ t.error }}</span>
    </div>

    <!-- 内容 -->
    <article v-else class="changelog-content" v-html="renderedContent" />
  </div>
</template>

<style scoped>
.changelog-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--vp-c-text-2);
}

.state iconify-icon {
  font-size: 2rem;
}

.state.error {
  color: var(--vp-c-danger-1);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.changelog-content {
  line-height: 1.8;
}

.changelog-content :deep(h2) {
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 1.5rem;
  font-weight: 600;
}

.changelog-content :deep(h2:first-child) {
  margin-top: 0;
}

.changelog-content :deep(h3) {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.changelog-content :deep(p),
.changelog-content :deep(ul) {
  margin: 0.75rem 0;
}

.changelog-content :deep(ul) {
  padding-left: 1.5rem;
}

.changelog-content :deep(li) {
  margin: 0.25rem 0;
}

.changelog-content :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.changelog-content :deep(a:hover) {
  text-decoration: underline;
}

.changelog-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-mute);
  font-size: 0.875em;
}

.changelog-content :deep(a code) {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.changelog-content :deep(hr) {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}
</style>