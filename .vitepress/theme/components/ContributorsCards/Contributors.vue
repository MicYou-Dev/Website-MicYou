<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";
import VPTeamMembers from "vitepress/dist/client/theme-default/components/VPTeamMembers.vue";
import { contributorsTranslations, type Lang } from "../../../data/i18n";
import { svgIcon } from "../../icon";

const { lang } = useData();
const t = computed(
	() =>
		contributorsTranslations[lang.value as Lang] ||
		contributorsTranslations["zh-CN"],
);

// 作者列表
const authors = computed(() => [
	{
		avatar: "https://github.com/LanRhyme.png?size=80",
		name: "LanRhyme",
		title: t.value.author,
		links: [
			{ icon: "github", link: "https://github.com/LanRhyme" },
			{
				icon: { svg: svgIcon.bilibili },
				link: "https://space.bilibili.com/496901387",
			},
		],
	},
	{
		avatar: "https://github.com/ChinsaaWei.png?size=80",
		name: "ChinsaaWei",
		title: t.value.author,
		links: [
			{ icon: "github", link: "https://github.com/ChinsaaWei" },
			{
				icon: { svg: svgIcon.bilibili },
				link: "https://space.bilibili.com/38902304",
			},
		],
	},
]);

// 运行时获取贡献者数据，避免浏览器缓存
const ghdata = ref<{ contributors: unknown[]; version: string }>({
	contributors: [],
	version: "",
});

const contributors = computed(() =>
	(
		ghdata.value.contributors as Array<{
			avatar_url: string;
			login: string;
			contributions: number;
			html_url: string;
		}>
	).map((c) => ({
		avatar: `${c.avatar_url}?size=80`,
		name: c.login,
		title: `${c.contributions} ${t.value.contributions}`,
		link: c.html_url,
	})),
);

onMounted(async () => {
	try {
		const res = await fetch(`/ghdata.json?t=${Date.now()}`);
		if (res.ok) {
			ghdata.value = await res.json();
		}
	} catch {}
});
</script>

<template>
  <section class="contributors-section">
    <!-- 作者展示 -->
    <div class="authors-wrapper">
      <h2 class="section-title">{{ t.developedWith }}</h2>
      <VPTeamMembers size="small" :members="authors" />
    </div>

    <!-- 贡献者展示 -->
    <div v-if="contributors.length > 0" class="contributors-wrapper">
      <h2 class="section-title">{{ t.thanksContributors }}</h2>
      <div class="contributors-grid">
        <a
          v-for="c in contributors"
          :key="c.name"
          :href="c.link"
          target="_blank"
          rel="noopener noreferrer"
          class="contributor-card"
        >
          <img :src="c.avatar" :alt="c.name" class="avatar" />
          <span class="name">{{ c.name }}</span>
          <span class="title">{{ c.title }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contributors-section {
  margin-top: 48px;
  padding: 0 24px;
}

.section-title {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 48px 0 24px;
}

.authors-wrapper,
.contributors-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.authors-wrapper :deep(.VPTeamMembers) {
  width: 100%;
}

.authors-wrapper :deep(.VPTeamMembers.small .container) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
}

.authors-wrapper :deep(.VPTeamMembers.small .item) {
  width: 100%;
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 1152px;
}

.contributor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 16px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s;
}

.contributor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--vp-shadow-2);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: var(--vp-shadow-1);
}

.name {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.title {
  margin-top: 2px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .contributors-section {
    padding: 0 16px;
  }

  .section-title {
    margin: 32px 0 20px;
    font-size: 1.125rem;
  }

  .contributors-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .contributors-section {
    margin-top: 32px;
    padding: 0 12px;
  }

  .section-title {
    margin: 24px 0 16px;
    font-size: 1rem;
  }

  .authors-wrapper :deep(.VPTeamMembers.small .container) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .contributors-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .contributor-card {
    padding: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>