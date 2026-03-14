<script setup lang="ts">
// 定义组件属性接口
interface Props {
  member: {
    avatar: string
    name: string
    link: string
    title?: string
  }
}

// 接收单个贡献者数据
const { member } = defineProps<Props>()
</script>

<template>
  <article class="ContributorsItem">
    <!-- 点击跳转到贡献者GitHub主页 -->
    <a class="profile" :href="member.link" target="_blank" rel="noopener noreferrer">
      <figure class="avatar">
        <img class="avatar-img" :src="member.avatar" :alt="member.name" />
      </figure>
      <div class="data">
        <h1 class="name">{{ member.name }}</h1>
        <p v-if="member.title" class="desc">{{ member.title }}</p>
      </div>
    </a>
  </article>
</template>

<style scoped>
/* 贡献者卡片基础样式 */
.ContributorsItem {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: var(--vp-c-bg-soft);
}

/* 悬停效果 */
.ContributorsItem:hover {
  transform: translateY(-5px);
  box-shadow: var(--vp-shadow-2);
}

/* 卡片内容区域 */
.ContributorsItem .profile {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ContributorsItem .data {
  padding-top: 16px;
  text-align: center;
}

/* 头像样式 */
.ContributorsItem .avatar {
  width: 64px;
  height: 64px;
  position: relative;
  flex-shrink: 0;
  margin: 0 auto;
  border-radius: 50%;
  box-shadow: var(--vp-shadow-3);
  overflow: hidden;
}

/* 头像图片样式 */
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 姓名样式 */
.ContributorsItem .name {
  margin: 0;
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* 描述样式 */
.ContributorsItem .desc {
  margin: 0;
  padding-top: 8px;
  line-height: 20px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

/* 链接样式 */
.profile {
  flex-grow: 1;
  text-decoration: none;
}
</style>