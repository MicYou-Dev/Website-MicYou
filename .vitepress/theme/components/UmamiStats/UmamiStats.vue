<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { umamiTranslations, type Lang } from "../../../data/i18n";

const { lang } = useData();
const stats = ref<{ pageviews: number; visits: number } | null>(null);
const displayStats = ref({ pageviews: 0, visits: 0 });

const t = computed(
	() => umamiTranslations[lang.value as Lang] ?? umamiTranslations["zh-CN"],
);

const CACHE_KEY = "umami-stats-cache";
const formatNum = (n: number) =>
	n >= 10000
		? `${(n / 10000).toFixed(1)}w`
		: n >= 1000
			? `${(n / 1000).toFixed(1)}k`
			: n;

// 数字滚动动画
function animateNumber(from: number, to: number, key: "pageviews" | "visits") {
	const duration = 800;
	const start = performance.now();
	const diff = to - from;

	const step = (now: number) => {
		const progress = Math.min((now - start) / duration, 1);
		const eased = 1 - (1 - progress) ** 3; // easeOutCubic
		displayStats.value[key] = Math.round(from + diff * eased);
		if (progress < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

// 更新数据并触发动画
function updateStats(newStats: { pageviews: number; visits: number }) {
	const oldPageviews = displayStats.value.pageviews;
	const oldVisits = displayStats.value.visits;

	animateNumber(oldPageviews, newStats.pageviews ?? 0, "pageviews");
	animateNumber(oldVisits, newStats.visits ?? 0, "visits");

	stats.value = newStats;
	localStorage.setItem(
		CACHE_KEY,
		JSON.stringify({ data: newStats, time: Date.now() }),
	);
}

onMounted(async () => {
	// 1. 先加载缓存
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			const { data } = JSON.parse(cached);
			displayStats.value = {
				pageviews: data.pageviews ?? 0,
				visits: data.visits ?? 0,
			};
			stats.value = data;
		}
	} catch {}

	// 2. 后台获取新数据
	try {
		const BASE = "https://umami.micyou.top";
		const shareRes = await fetch(`${BASE}/api/share/ca3lqhEXL5TaJrwv`);
		if (!shareRes.ok) return;
		const { token, websiteId } = await shareRes.json();
		if (!token || !websiteId) return;

		const statsRes = await fetch(
			`${BASE}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}`,
			{
				headers: { "x-umami-share-token": token },
			},
		);
		if (!statsRes.ok) return;
		const newStats = await statsRes.json();
		updateStats(newStats);
	} catch (e) {
		console.error("Umami stats error:", e);
	}
});
</script>

<template>
  <div class="umami-stats">
    <span v-if="!stats">{{ t.loading }}</span>
    <span v-else>
      <strong>{{ formatNum(displayStats.pageviews) }}</strong> {{ t.views }}
      <strong>{{ formatNum(displayStats.visits) }}</strong> {{ t.visits }}
    </span>
  </div>
</template>

<style scoped>
.umami-stats {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
.umami-stats strong {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  min-width: 2.5em;
  display: inline-block;
  text-align: right;
}
@media (max-width: 960px) {
  .umami-stats {
    display: none;
  }
}
</style>