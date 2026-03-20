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
			<div
				class="changelog-body"
				v-html="entry.html_body"
			/>
		</div>
		<div v-if="entries.length === 0" class="changelog-empty">
			暂无更新日志
		</div>
	</div>
</template>

<style scoped>
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

.changelog-body :deep(a) {
	color: var(--vp-c-brand-1);
	text-decoration: none;
}

.changelog-body :deep(a:hover) {
	text-decoration: underline;
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
