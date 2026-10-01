<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { thankYouTranslations, type Lang } from "../../data/i18n";

const { lang } = useData();
const t = computed(
	() =>
		thankYouTranslations[lang.value as Lang] || thankYouTranslations["zh-CN"],
);

const sponsors = computed(() => {
	const currentLang = (lang.value as Lang) || "zh-CN";
	const mirrorChyanUrl =
		currentLang === "en"
			? "https://mirrorchyan.com/en/projects?rid=MicYou"
			: "https://mirrorchyan.com/zh/projects?rid=MicYou";

	return [
		{
			icon: "/hernet.ico",
			name: t.value.hernetName,
			desc: t.value.hernetDesc,
			link: "https://mirrors.ha.edu.cn/github-release/LanRhyme/MicYou/",
		},
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
			link: mirrorChyanUrl,
		},
	];
});
</script>

<template>
  <section class="thankyou-section">
    <div class="thankyou-container">
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
    </div>
  </section>
</template>

<style scoped>
.thankyou-section {
  margin-top: 64px;
  padding: 0 24px;
  text-align: left;
}

.thankyou-container {
  max-width: 1152px;
  margin: 0 auto;
  text-align: left;
}

.thankyou-title {
  color: var(--vp-c-text-2);
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
}

.thankyou-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

.thankyou-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s;
  text-align: left;
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
  text-align: left;
  gap: 4px;
}

.thankyou-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-align: left;
}

.thankyou-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  text-align: left;
}

@media (max-width: 860px) {
  .thankyou-section {
    margin-top: 48px;
    padding: 0 16px;
  }

  .thankyou-container {
    max-width: 540px;
  }

  .thankyou-grid {
    grid-template-columns: 1fr;
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
