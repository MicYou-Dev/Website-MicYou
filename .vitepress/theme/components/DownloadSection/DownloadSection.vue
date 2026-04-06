<script setup lang="ts">
import { useData } from "vitepress";
import { computed, ref } from "vue";
import {
	downloadTranslations,
	type DownloadKey,
	type Lang,
} from "../../../data/i18n";
import ghdata from "../../../../src/ghdata.json";

const { lang } = useData();
const t = computed(
	() =>
		downloadTranslations[lang.value as Lang] || downloadTranslations["zh-CN"],
);
const version = ref(ghdata.version);
const copied = ref<string | null>(null);
const useMirror = ref(false);

const platforms: {
	name: string;
	icon: string;
	desc: DownloadKey;
	files: {
		name: DownloadKey;
		pattern?: string;
		copy?: string;
	}[];
}[] = [
	{
		name: "Windows",
		icon: "simple-icons:windows",
		desc: "windowsDesc",
		files: [
			{
				name: "installer",
				pattern: "MicYou-Win-{version}-installer.exe",
			},
			{
				name: "portableJRE",
				pattern: "MicYou-Win-{version}.zip",
			},
			{
				name: "portableNoJRE",
				pattern: "MicYou-Win-NoJRE-{version}.zip",
			},
		],
	},
	{
		name: "macOS",
		icon: "simple-icons:macos",
		desc: "macOSDesc",
		files: [
			{
				name: "dmgArm",
				pattern: "MicYou-macOS-{version}-arm64.dmg",
			},
			{
				name: "dmgIntel",
				pattern: "MicYou-macOS-{version}-x64.dmg",
			},
			{
				name: "portableNoJRE",
				pattern: "MicYou-macOS-NoJRE-{version}.tar.gz",
			},
		],
	},
	{
		name: "Linux",
		icon: "simple-icons:linux",
		desc: "linuxDesc",
		files: [
			{
				name: "deb",
				pattern: "MicYou-Linux-{version}.deb",
			},
			{
				name: "rpm",
				pattern: "MicYou-Linux-{version}.rpm",
			},
			{ name: "arch", copy: "paru -S micyou-bin" },
			{
				name: "portableNoJRE",
				pattern: "MicYou-Linux-NoJRE-{version}.tar.gz",
			},
		],
	},
	{
		name: "Android",
		icon: "simple-icons:android",
		desc: "androidDesc",
		files: [
			{
				name: "apk",
				pattern: "MicYou-Android-{version}.apk",
			},
		],
	},
];

const githubUrl = (pattern: string) =>
	`https://github.com/LanRhyme/MicYou/releases/download/v${version.value}/${pattern.replace("{version}", version.value)}`;

const mirrorUrl = (pattern: string) =>
	`https://atomgit.com/gh_mirrors/mi/MicYou/releases/download/v${version.value}/${pattern.replace("{version}", version.value)}`;

const getUrl = (pattern: string) => {
	return useMirror.value ? mirrorUrl(pattern) : githubUrl(pattern);
};

const copyCmd = async (cmd: string) => {
	await navigator.clipboard.writeText(cmd);
	copied.value = cmd;
	setTimeout(() => (copied.value = null), 2000);
};

const changelogLink = computed(() => {
	const currentLang = lang.value as Lang;
	switch (currentLang) {
		case "en":
			return "/en/changelog";
		case "zh-TW":
			return "/zh-TW/changelog";
		default:
			return "/changelog";
	}
});
</script>

<template>
  <div class="dl">
    <header class="dl-head">
      <h1>{{ t.title }}</h1>
      <span class="ver">v{{ version }}</span>
    </header>

    <div class="card">
      <!-- 下载源切换 -->
      <div class="mirror-switch">
        <span class="source-label" :class="{ active: !useMirror }">{{ t.sourceGithub }}</span>
        <label class="switch">
          <input type="checkbox" v-model="useMirror">
          <span class="slider"></span>
        </label>
        <span class="source-label" :class="{ active: useMirror }">{{ t.sourceMirror }}</span>
        <span class="switch-tip">{{ t.mirrorTip }}</span>
      </div>
      <div v-for="(p, i) in platforms" :key="p.name" class="row" :class="{ border: i }">
        <div class="info">
          <iconify-icon :icon="p.icon" class="icon" />
          <div>
            <h3>{{ p.name }}</h3>
            <p>{{ t[p.desc] }}</p>
          </div>
        </div>
        <div class="opts">
          <template v-for="f in p.files" :key="f.pattern || f.copy">
            <a
              v-if="f.pattern"
              :href="getUrl(f.pattern)"
              class="btn"
              target="_blank"
            >
              <iconify-icon icon="mdi:download" />{{ t[f.name] }}
            </a>
            <button v-else class="btn" :class="{ done: copied === f.copy }" @click="copyCmd(f.copy!)">
              <iconify-icon :icon="copied === f.copy ? 'mdi:check' : 'mdi:content-copy'" />
              {{ copied === f.copy ? t.copied : t[f.name] }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <p class="notes">
      <a :href="changelogLink">{{ t.viewReleaseNotes }}</a>
      <span class="separator">|</span>
      <a href="https://nightly.link/LanRhyme/MicYou/workflows/development/master?preview" target="_blank">{{ t.nightly }}</a>
    </p>
  </div>
</template>

<style scoped>
.dl {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.dl-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  color: #5a7a9d;
}

.dl-head h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.ver {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.mirror-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.source-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  transition: color 0.2s;
}

.source-label.active {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.switch-tip {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-left: 8px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--vp-c-divider);
  border-radius: 22px;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .slider {
  background: var(--vp-c-brand-1);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.row {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.row:hover {
  background: var(--vp-c-bg);
}

.row.border {
  border-top: 1px solid var(--vp-c-divider);
}

.info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon {
  font-size: 1.75rem;
  color: var(--vp-c-brand-1);
}

.info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.info p {
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.opts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover,
.btn.done {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

.notes {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.notes a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.notes a:hover {
  text-decoration: underline;
}

.separator {
  color: var(--vp-c-divider);
  margin: 0 12px;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .dl-head {
    flex-direction: column;
    gap: 12px;
  }

  .dl-head h1 {
    font-size: 1.5rem;
  }

  .mirror-switch {
    flex-wrap: wrap;
  }
}
</style>