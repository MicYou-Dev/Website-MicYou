<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import ContributorsItem from './ContributorsItem.vue'
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { contributorsTranslations, type Lang } from '../../../data/i18n'

const { lang } = useData()

// 获取当前语言的翻译
const t = computed(() => {
  const currentLang = lang.value as Lang
  return contributorsTranslations[currentLang] || contributorsTranslations['zh-CN']
})

// 作者列表 - 使用 VitePress TeamMembers 样式
const authors = computed(() => [
  {
    avatar: 'https://github.com/LanRhyme.png?size=80',
    name: 'LanRhyme',
    title: t.value.author,
    links: [
      { icon: 'github', link: 'https://github.com/LanRhyme' }
    ]
  },
  {
    avatar: 'https://github.com/ChinsaaWei.png?size=80',
    name: 'ChinsaaWei',
    title: t.value.author,
    links: [
      { icon: 'github', link: 'https://github.com/ChinsaaWei' }
    ]
  }
])

// 贡献者列表 - 从 GitHub API 获取
const contributors = ref<Array<{
  avatar: string
  name: string
  title: string
  link: string
}>>([])

const loading = ref(true)

// 作者用户名集合，用于过滤
const authorUsernames = new Set(['LanRhyme', 'ChinsaaWei'])

// bot 账号集合
const botUsernames = new Set(['dependabot[bot]', 'Crowdin Bot'])

// 缓存配置
const CACHE_KEY = 'contributors-cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 小时

interface CachedData {
  data: Array<{
    avatar: string
    name: string
    title: string
    link: string
  }>
  timestamp: number
  lang: string
}

// 从缓存获取数据
function getCachedData(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached) as CachedData
    const now = Date.now()

    // 检查缓存是否过期
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}

// 保存数据到缓存
function setCachedData(data: CachedData['data'], currentLang: string) {
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
      lang: currentLang
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch {
    // localStorage 可能已满或不可用，静默失败
  }
}

onMounted(async () => {
  // 先尝试从缓存获取
  const cached = getCachedData()
  if (cached && cached.lang === lang.value) {
    contributors.value = cached.data
    loading.value = false
    return
  }

  try {
    const response = await fetch('https://api.github.com/repos/LanRhyme/MicYou/stats/contributors')
    if (!response.ok) throw new Error('Failed to fetch contributors')

    const data = await response.json()

    // 检查返回数据是否为数组（GitHub API 有时返回 202 状态的对象）
    if (!Array.isArray(data)) {
      throw new Error('Contributors data is not ready yet')
    }

    // 过滤掉作者和 bot 账号，并按贡献数降序排列
    const contributorsData = data
      .filter((c: any) => {
        const login = c.author?.login
        return login && !authorUsernames.has(login) && !botUsernames.has(login) && !login.includes('[bot]')
      })
      .sort((a: any, b: any) => b.total - a.total)
      .map((c: any) => ({
        avatar: `${c.author.avatar_url}&size=80`,
        name: c.author.login,
        title: `${c.total} ${t.value.contributions}`,
        link: c.author.html_url
      }))

    contributors.value = contributorsData
    // 保存到缓存
    setCachedData(contributorsData, lang.value as string)
  } catch (error) {
    console.error('Failed to load contributors:', error)
    // 如果请求失败但有旧缓存，仍然使用旧缓存
    if (cached) {
      contributors.value = cached.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="contributors-section">
    <!-- 作者展示 - 使用 VitePress TeamMembers 组件 -->
    <div class="authors-wrapper">
      <h2 class="section-title">
        {{ t.developedWith }}
      </h2>
      <VPTeamMembers size="small" :members="authors" />
    </div>

    <!-- 贡献者展示 - 使用 feature 风格卡片 -->
    <div v-if="contributors.length > 0" class="contributors-wrapper">
      <h2 class="section-title">
        {{ t.thanksContributors }}
      </h2>
      <div class="contributors-grid">
        <ContributorsItem
          v-for="contributor in contributors"
          :key="contributor.name"
          :member="contributor"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.contributors-section {
  margin-top: 48px;
  padding: 0 24px;
}

.authors-wrapper,
.contributors-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 48px 0 24px;
  padding-bottom: 8px;
}

/* 作者卡片并排等宽撑满 */
.authors-wrapper {
  width: 100%;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .contributors-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>