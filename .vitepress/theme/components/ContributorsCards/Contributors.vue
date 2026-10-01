<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useData } from "vitepress";
import VPTeamMembers from "vitepress/dist/client/theme-default/components/VPTeamMembers.vue";
import { contributorsTranslations, type Lang } from "../../../data/i18n";
import { useGhData } from "../../composables/useGhData";
import { svgIcon } from "../../icon";

const { lang } = useData();
const t = computed(
	() =>
		contributorsTranslations[lang.value as Lang] ||
		contributorsTranslations["zh-CN"],
);

// 作者与维护者列表
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
		title: t.value.maintainer,
		links: [
			{ icon: "github", link: "https://github.com/ChinsaaWei" },
			{
				icon: { svg: svgIcon.bilibili },
				link: "https://space.bilibili.com/38902304",
			},
		],
	},
	{
		avatar: "https://github.com/ChouChiu.png?size=80",
		name: "ChouChiu",
		title: t.value.maintainer,
		links: [
			{ icon: "github", link: "https://github.com/ChouChiu" },
			{
				icon: { svg: svgIcon.bilibili },
				link: "https://space.bilibili.com/2016933117",
			},
		],
	},
	{
		avatar: "https://github.com/OrientCOMPASS.png?size=80",
		name: "OrientCOMPASS",
		title: t.value.maintainer,
		links: [{ icon: "github", link: "https://github.com/OrientCOMPASS" }],
	},
]);

const { ghData, loadGhData } = useGhData();

onMounted(() => {
	loadGhData();
});

const contributors = computed(() =>
	ghData.value.contributors.map((c) => ({
		avatar: `${c.avatar_url}?size=80`,
		name: c.login,
		title: `${c.contributions} ${t.value.contributions}`,
		link: c.html_url,
	})),
);
</script>

<template>
  <section class="contributors-section">
    <!-- 作者展示 -->
    <div class="authors-wrapper">
      <h2 class="section-title">{{ t.developedWith }}</h2>
      <VPTeamMembers size="small" :members="authors" />
    </div>

    <!-- 赞助支持 -->
    <div class="support-wrapper">
      <div class="support-card">
        <div class="support-content">
          <svg class="support-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <div class="support-text">
            <span class="support-title">{{ t.sponsorTitle }}</span>
            <span class="support-desc">{{ t.sponsorDesc }}</span>
          </div>
        </div>
        <a
          href="https://afdian.com/a/LanRhyme"
          target="_blank"
          rel="noopener noreferrer"
          class="support-btn"
        >
          <span>{{ t.sponsorBtn }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
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
  max-width: 1152px;
}

.authors-wrapper :deep(.VPTeamMembers.small .container) {
  display: grid;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 20px;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto;
}

.authors-wrapper :deep(.VPTeamMembersItem.small .profile) {
  padding: 1.5rem 1rem;
}

@media (max-width: 860px) {
  .authors-wrapper :deep(.VPTeamMembers.small .container) {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 14px;
  }
}

.authors-wrapper :deep(.VPTeamMembers.small .item) {
  width: 100%;
}

.support-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 24px;
}

.support-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  max-width: 1152px;
  padding: 18px 24px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.support-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-2);
}

.support-content {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.support-icon {
  color: #e74c3c;
  flex-shrink: 0;
}

.support-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.support-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.support-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.support-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1) !important;
  background: var(--vp-c-brand-soft);
  text-decoration: none !important;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.2s, color 0.2s;
}

.support-btn:hover {
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
}

@media (max-width: 768px) {
  .support-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px;
    gap: 14px;
  }

  .support-btn {
    width: 100%;
    justify-content: center;
  }
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
    grid-template-columns: 1fr !important;
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