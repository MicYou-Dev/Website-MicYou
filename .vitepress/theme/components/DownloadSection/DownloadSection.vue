<script setup lang="ts">
import { useData } from "vitepress";
import { computed, onMounted, ref } from "vue";
import { downloadTranslations, type Lang } from "../../../data/i18n";

const { lang } = useData();
const t = computed(
	() =>
		downloadTranslations[lang.value as Lang] || downloadTranslations["zh-CN"],
);

const latestVersion = ref("");
const loading = ref(true);
const error = ref(false);
const copiedId = ref<string | null>(null);

const _platforms = computed(() => [
	{
		name: "Windows",
		icon: "simple-icons:windows",
		description: t.value.windowsDesc,
		files: [
			{
				name: t.value.installer,
				pattern: "MicYou-Win-{version}-installer.exe",
			},
			{
				name: `${t.value.portable} (JRE)`,
				pattern: "MicYou-Win-{version}.zip",
			},
			{
				name: `${t.value.portable} (NoJRE)`,
				pattern: "MicYou-Win-NoJRE-{version}.zip",
			},
		],
	},
	{
		name: "macOS",
		icon: "simple-icons:macos",
		description: t.value.macOSDesc,
		files: [
			{
				name: "DMG (Apple Silicon)",
				pattern: "MicYou-macOS-{version}-arm64.dmg",
			},
			{ name: "DMG (Intel)", pattern: "MicYou-macOS-{version}-x64.dmg" },
			{
				name: `${t.value.portable} (NoJRE)`,
				pattern: "MicYou-macOS-NoJRE-{version}.tar.gz",
			},
		],
	},
	{
		name: "Linux",
		icon: "simple-icons:linux",
		description: t.value.linuxDesc,
		files: [
			{ name: "DEB", pattern: "MicYou-Linux-{version}.deb" },
			{ name: "RPM", pattern: "MicYou-Linux-{version}.rpm" },
			{ name: "Arch", copyCommand: "paru -S micyou-bin" },
			{
				name: `${t.value.portable} (NoJRE)`,
				pattern: "MicYou-Linux-NoJRE-{version}.tar.gz",
			},
		],
	},
	{
		name: "Android",
		icon: "simple-icons:android",
		description: t.value.androidDesc,
		files: [{ name: "APK", pattern: "MicYou-Android-{version}.apk" }],
	},
]);

const _getDownloadUrl = (pattern: string) =>
	`https://github.com/LanRhyme/MicYou/releases/download/v${latestVersion.value}/${pattern.replace("{version}", latestVersion.value)}`;

const _copyCommand = async (cmd: string) => {
	try {
		await navigator.clipboard.writeText(cmd);
		copiedId.value = cmd;
		setTimeout(() => (copiedId.value = null), 2000);
	} catch {
		/* ignore */
	}
};

onMounted(async () => {
	const CACHE_KEY = "micyou-version";
	const CACHE_TTL = 6 * 60 * 60 * 1000;

	try {
		const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
		if (cached.version && Date.now() - cached.time < CACHE_TTL) {
			latestVersion.value = cached.version;
			return;
		}

		const res = await fetch(
			"https://api.github.com/repos/LanRhyme/MicYou/releases/latest",
		);
		const data = await res.json();
		latestVersion.value = data.tag_name.replace(/^v/, "");
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ version: latestVersion.value, time: Date.now() }),
		);
	} catch {
		error.value = true;
	} finally {
		loading.value = false;
	}
});
</script>

<template>
  <div class="download-container">
    <div class="download-header">
      <h1 class="download-title">{{ t.title }}</h1>
      <span v-if="latestVersion" class="version-badge">v{{ latestVersion }}</span>
    </div>

    <div v-if="loading" class="state-center">
      <span class="loading-spinner"></span>
      <span>{{ t.loading }}</span>
    </div>

    <div v-else-if="error" class="state-center">
      <p>{{ t.error }}</p>
      <a href="https://github.com/LanRhyme/MicYou/releases/latest" target="_blank" class="fallback-link">
        {{ t.viewOnGitHub }}
      </a>
    </div>

    <template v-else>
      <div class="download-card">
        <template v-for="(platform, idx) in _platforms" :key="platform.name">
          <div v-if="idx" class="divider"></div>
          <div class="download-row">
            <div class="platform-info">
              <div class="platform-icon">
                <iconify-icon :icon="platform.icon" />
              </div>
              <div>
                <h3>{{ platform.name }}</h3>
                <p>{{ platform.description }}</p>
              </div>
            </div>
            <div class="download-options">
              <template v-for="file in platform.files" :key="file.pattern || file.copyCommand">
                <a v-if="file.pattern" :href="_getDownloadUrl(file.pattern)" class="btn" target="_blank">
                  <iconify-icon icon="mdi:download" />
                  <span>{{ file.name }}</span>
                </a>
                <button v-else class="btn" :class="{ copied: copiedId === file.copyCommand }" @click="_copyCommand(file.copyCommand!)">
                  <iconify-icon :icon="copiedId === file.copyCommand ? 'mdi:check' : 'mdi:content-copy'" />
                  <span>{{ copiedId === file.copyCommand ? t.copied : file.name }}</span>
                </button>
              </template>
            </div>
          </div>
        </template>
      </div>

      <div class="release-notes">
        <a href="https://github.com/LanRhyme/MicYou/releases/latest" target="_blank">
          {{ t.viewReleaseNotes }}
        </a>
      </div>
    </template>
  </div>
</template>

<style scoped>
.download-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.download-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.download-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(120deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.5;
}

.version-badge {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.state-center {
  text-align: center;
  padding: 64px 24px;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 12px;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

.fallback-link {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: white;
  text-decoration: none;
  font-weight: 600;
}

.fallback-link:hover { background: var(--vp-c-brand-2); }

.download-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.divider {
  height: 1px;
  background: var(--vp-c-divider);
  margin: 0 24px;
}

.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  transition: background 0.2s;
}

.download-row:hover { background: var(--vp-c-bg); }

.platform-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.platform-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  font-size: 1.75rem;
  color: var(--vp-c-brand-1);
}

.platform-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.platform-info p {
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.download-options {
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

.btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.btn.copied {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.release-notes {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.release-notes a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.release-notes a:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .download-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .platform-info { width: 100%; }
  .download-options { width: 100%; }
  .download-header { flex-direction: column; gap: 12px; }
  .download-title { font-size: 1.5rem; }
}
</style>