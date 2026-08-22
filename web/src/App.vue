<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">⚔️</span>
        <span class="brand-text">紫队实验台<em>Purple Team Lab</em></span>
      </div>
      <nav class="nav">
        <RouterLink to="/" :class="{ on: route.name === 'scenarios' }">场景库</RouterLink>
        <RouterLink to="/runs" :class="{ on: route.name === 'runs' }">验证任务</RouterLink>
        <RouterLink to="/report" :class="{ on: route.name === 'report' }">检测报告</RouterLink>
      </nav>
      <a class="gh" href="https://github.com/hedongli1/purple-team-lab" target="_blank" rel="noopener">GitHub ↗</a>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>