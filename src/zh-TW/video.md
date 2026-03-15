---
aside: false
---

# 影片教學

<div class="video-wrapper">
<div class="video-grid">

<div class="video-item">
  <span>專案簡介</span>
  <iframe src="//player.bilibili.com/player.html?bvid=BV1oucszjE5u&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>

<div class="video-item">
  <span>更新介紹</span>
  <iframe src="//player.bilibili.com/player.html?bvid=BV1KufpBQEtT&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>

<div class="video-item">
  <span>使用教學 (Bilibili)</span>
  <iframe src="//player.bilibili.com/player.html?bvid=BV1MpNKz8ELw&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
</div>

<div class="video-item">
  <span>使用教學 (YouTube)</span>
  <iframe src="https://www.youtube.com/embed/x6LQIMbf36w" frameborder="0" allowfullscreen="true"></iframe>
</div>

</div>
</div>

<style>
.video-wrapper {
  max-width: 960px;
  margin: 0 auto;
}
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 1rem 0;
}
.video-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.video-item span {
  font-weight: 500;
  font-size: 0.95rem;
}
.video-item iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>