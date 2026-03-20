<script setup lang="ts">
import { useData } from "vitepress";
import changelogData from "../../../../src/changelog.json";

interface ChangelogEntry {
  tag_name: string;
  published_at: string;
  html_url: string;
  html_body: string;
  name: string;
}

const { lang } = useData();
const entries: ChangelogEntry[] = changelogData.entries || [];

const localeMap: Record<string, string> = {
  "zh-CN": "zh-CN",
  en: "en-US",
  "zh-TW": "zh-TW",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const locale = localeMap[lang.value] || "zh-CN";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 处理 changelog-body 内的链接点击（事件委托，仅在客户端执行）
const handleBodyClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest("a");
  if (!anchor) return;

  // 阻止 Vue Router 默认拦截（避免相对路径被当作内部路由）
  e.preventDefault();

  let href = anchor.getAttribute("href");
  if (!href) return;

  // 相对路径转绝对（基于 GitHub release 页面的 base URL）
  if (!href.startsWith("http") && !href.startsWith("//")) {
    // 假设所有链接都属于 GitHub 域，取第一个 entry 的 html_url 作为 base
    const baseUrl = entries[0]?.html_url?.replace(/\/releases\/.*$/, "") || "https://github.com";
    href = baseUrl + (href.startsWith("/") ? href : "/" + href);
  }

  // 设置安全属性并跳转
  const newWindow = window.open(href, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
</script>

<template>
  <div class="changelog-list">
    <div
      v-for="entry in entries"
      :key="entry.tag_name"
      class="changelog-entry"
    >
      <div class="changelog-header">
        <h2 class="changelog-version">
          <a
            :href="entry.html_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ entry.tag_name }}
          </a>
        </h2>
        <span class="changelog-date">{{ formatDate(entry.published_at) }}</span>
      </div>
      <!-- 使用事件委托处理内部链接跳转 -->
      <div
        class="changelog-body"
        v-html="entry.html_body"
        @click="handleBodyClick"
      />
    </div>
    <div v-if="entries.length === 0" class="changelog-empty">
      暂无更新日志
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.changelog-list {
  max-width: 800px;
  margin: 0 auto;
}

.changelog-entry {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.changelog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.changelog-version {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.changelog-version a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}

.changelog-version a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.changelog-date {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.changelog-body {
  line-height: 1.6;
}

/* 确保 v-html 内的链接样式生效 */
.changelog-body :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}

.changelog-body :deep(a:hover) {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.changelog-body :deep(h2) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.changelog-body :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.changelog-body :deep(ul) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.changelog-body :deep(li) {
  margin: 0.25rem 0;
}

.changelog-body :deep(p) {
  margin: 0.5rem 0;
}

.changelog-body :deep(strong) {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.changelog-empty {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 768px) {
  .changelog-entry {
    padding: 1rem;
  }

  .changelog-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .changelog-version {
    font-size: 1.1rem;
  }
}
</style>
