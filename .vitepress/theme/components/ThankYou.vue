<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { thankYouTranslations, type Lang } from "../../data/i18n";

const { lang } = useData();
const t = computed(
	() =>
		thankYouTranslations[lang.value as Lang] || thankYouTranslations["zh-CN"],
);

const sponsors = computed(() => [
	{
		icon: "/cqu.ico",
		name: t.value.cquName,
		desc: t.value.cquDesc,
		link: "https://mirrors.cqu.edu.cn/github-release/LanRhyme/MicYou/",
	},
	{
		icon: "/mirrorchyan.ico",
		name: t.value.mirrorName,
		desc: t.value.mirrorDesc,
		link: "https://mirrorchyan.com/zh/projects?rid=MicYou",
	},
]);
</script>

<template>
  <section class="thankyou-section">
    <h2 class="thankyou-title">{{ t.title }}</h2>
    <div class="thankyou-grid">
      <a
        v-for="s in sponsors"
        :key="s.name"
        :href="s.link"
        target="_blank"
        rel="noopener noreferrer"
        class="thankyou-card"
      >
        <img :src="s.icon" :alt="s.name" class="thankyou-icon" />
        <div class="thankyou-info">
          <span class="thankyou-name">{{ s.name }}</span>
          <span class="thankyou-desc">{{ s.desc }}</span>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.thankyou-section {
  margin-top: 64px;
  padding: 0 24px;
  text-align: center;
}

.thankyou-title {
  color: var(--vp-c-text-2);
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.thankyou-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}

.thankyou-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 28px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s;
}

.thankyou-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--vp-shadow-2);
}

.thankyou-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.thankyou-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.thankyou-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.thankyou-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .thankyou-section {
    margin-top: 48px;
    padding: 0 12px;
  }

  .thankyou-grid {
    flex-direction: column;
    align-items: center;
  }

  .thankyou-card {
    width: 100%;
    padding: 14px 16px;
  }

  .thankyou-icon {
    width: 32px;
    height: 32px;
  }

  .thankyou-name {
    font-size: 14px;
  }

  .thankyou-desc {
    font-size: 12px;
  }
}
</style>
