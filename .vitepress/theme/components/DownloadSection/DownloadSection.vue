<script setup lang="ts">
import { useData } from "vitepress";
import { computed, onMounted, ref, watch } from "vue";
import {
	downloadTranslations,
	type DownloadKey,
	type Lang,
} from "../../../data/i18n";

const { lang } = useData();
const t = computed(
	() =>
		downloadTranslations[lang.value as Lang] || downloadTranslations["zh-CN"],
);
const version = ref("");

onMounted(async () => {
	try {
		const res = await fetch(`/ghdata.json?t=${Date.now()}`);
		if (res.ok) {
			const data = await res.json();
			version.value = data.version;
		}
	} catch {}
});
const copied = ref<string | null>(null);

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

const cquMirrorUrl = (pattern: string) =>
	`https://mirrors.cqu.edu.cn/github-release/LanRhyme/MicYou/${pattern.replace("{version}", version.value)}`;

const getUrl = (pattern: string) =>
	useMirror.value ? cquMirrorUrl(pattern) : githubUrl(pattern);

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

const mirrorLink = computed(() => {
	const currentLang = lang.value as Lang;
	return currentLang === "en"
		? "https://mirrorchyan.com/en/projects?rid=MicYou"
		: "https://mirrorchyan.com/zh/projects?rid=MicYou";
});

const useMirror = ref(false);
const showWarning = ref(false);
let warningTimer: ReturnType<typeof setTimeout> | null = null;

watch(useMirror, (val) => {
	if (val) {
		if (warningTimer) clearTimeout(warningTimer);
		showWarning.value = true;
		warningTimer = setTimeout(() => (showWarning.value = false), 4000);
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
      <a :href="mirrorLink" target="_blank" class="mirror-banner">
        <iconify-icon icon="mdi:cloud-download-outline" />
        {{ t.mirror }}
      </a>
      <div class="source-toggle">
        <span :class="{ active: !useMirror }">GitHub</span>
        <label class="switch">
          <input v-model="useMirror" type="checkbox" />
          <span class="slider" />
        </label>
        <span :class="{ active: useMirror }">CQU Mirror</span>
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

    <Transition name="snackbar">
      <div v-if="showWarning" class="snackbar">
        <iconify-icon icon="mdi:alert-circle-outline" />
        {{ t.mirrorWarning }}
      </div>
    </Transition>

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

.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.mirror-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--vp-c-brand-soft), var(--vp-c-brand-1));
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: all 0.2s;
}

.mirror-banner:hover {
  opacity: 0.9;
}

.mirror-banner iconify-icon {
  font-size: 1.25rem;
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

.source-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.source-toggle .active {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.switch {
  position: relative;
  width: 40px;
  height: 22px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: var(--vp-c-divider);
  border-radius: 22px;
  transition: background 0.25s;
}

.slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
}

.switch input:checked + .slider {
  background: var(--vp-c-brand-1);
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}

.snackbar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  background: #e65100;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 1000;
}

.dark .snackbar {
  background: #ef6c00;
}

.snackbar-enter-active,
.snackbar-leave-active {
  transition: all 0.3s ease;
}

.snackbar-enter-from,
.snackbar-leave-to {
  opacity: 0;
  transform: translateY(16px);
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
}
</style>