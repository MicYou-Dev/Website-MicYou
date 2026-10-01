<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
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

const activeRafs: { pageviews?: number; visits?: number } = {};

// 数字滚动动画
function animateNumber(from: number, to: number, key: "pageviews" | "visits") {
	const currentRaf = activeRafs[key];
	if (currentRaf !== undefined) {
		cancelAnimationFrame(currentRaf);
		delete activeRafs[key];
	}

	const duration = 800;
	const start = performance.now();
	const diff = to - from;

	const step = (now: number) => {
		const progress = Math.min((now - start) / duration, 1);
		const eased = 1 - (1 - progress) ** 3; // easeOutCubic
		displayStats.value[key] = Math.round(from + diff * eased);
		if (progress < 1) {
			activeRafs[key] = requestAnimationFrame(step);
		} else {
			delete activeRafs[key];
		}
	};
	activeRafs[key] = requestAnimationFrame(step);
}

onUnmounted(() => {
	for (const key of ["pageviews", "visits"] as const) {
		const currentRaf = activeRafs[key];
		if (currentRaf !== undefined) {
			cancelAnimationFrame(currentRaf);
			delete activeRafs[key];
		}
	}
});

// 更新数据并触发动画
function updateStats(newStats: { pageviews: number; visits: number }) {
	const oldPageviews = displayStats.value.pageviews;
	const oldVisits = displayStats.value.visits;

	animateNumber(oldPageviews, newStats.pageviews ?? 0, "pageviews");
	animateNumber(oldVisits, newStats.visits ?? 0, "visits");

	stats.value = newStats;
	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ data: newStats, time: Date.now() }),
		);
	} catch {
		// 忽略 localStorage 配额超出或隐身模式写入失败
	}
}

const isLoading = ref(true);

// Umami Cloud 配置
const REGIONAL_BASE = "https://cloud.umami.is/analytics/us";
const DEFAULT_BASE = "https://cloud.umami.is";
const UMAMI_SHARE_ID = "H2c4vaxEumXlocXR";

onMounted(async () => {
	// 1. 先加载缓存
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			const { data } = JSON.parse(cached) as {
				data?: { pageviews?: number; visits?: number };
			};
			if (data && typeof data === "object") {
				const pageviews = Number(data.pageviews) || 0;
				const visits = Number(data.visits) || 0;
				displayStats.value = { pageviews, visits };
				stats.value = { pageviews, visits };
			}
		}
	} catch {
		// 缓存格式异常，忽略
	}

	// 2. 后台获取新数据
	try {
		if (!UMAMI_SHARE_ID) {
			isLoading.value = false;
			return;
		}

		// 优先请求区域路由，失败时回退至默认端点
		let base = REGIONAL_BASE;
		let shareRes = await fetch(`${base}/api/share/${UMAMI_SHARE_ID}`);
		if (!shareRes.ok) {
			base = DEFAULT_BASE;
			shareRes = await fetch(`${base}/api/share/${UMAMI_SHARE_ID}`);
		}
		if (!shareRes.ok) {
			isLoading.value = false;
			return;
		}

		const { token, websiteId } = await shareRes.json();
		if (!token || !websiteId) {
			isLoading.value = false;
			return;
		}

		const statsRes = await fetch(
			`${base}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}&_t=${Date.now()}`,
			{
				headers: {
					"x-umami-share-token": token,
					"x-umami-share-context": "true",
					"Cache-Control": "no-cache",
				},
			},
		);
		if (!statsRes.ok) {
			isLoading.value = false;
			return;
		}
		const newStats = await statsRes.json();
		updateStats(newStats);
	} catch (e) {
		console.error("Umami stats error:", e);
	} finally {
		isLoading.value = false;
	}
});
</script>

<template>
  <div v-if="stats || isLoading" class="umami-stats">
    <span v-if="!stats && isLoading">{{ t.loading }}</span>
    <span v-else-if="stats">
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