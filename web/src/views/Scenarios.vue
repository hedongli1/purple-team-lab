<template>
  <div>
    <h1 class="page-title">攻击场景库</h1>
    <p class="page-sub">勾选要验证的模拟攻击场景（纯离线数据模拟，不会发起任何真实网络行为），一键生成检测验证报告</p>

    <div class="toolbar">
      <span class="hint">已选 {{ picked.length }} / {{ scenList.length }} 个场景</span>
      <div class="picked">
        <button class="btn btn-ghost" @click="checkAll(scenList.map(s => s.slug))">全选</button>
        <button class="btn btn-ghost" @click="checkAll([])">清空</button>
        <button class="btn btn-primary" :disabled="!picked.length || loading" @click="run">
          {{ loading ? '验证中…' : `发起验证（${picked.length}）` }}
        </button>
      </div>
    </div>

    <p v-if="error">{{ error }}</p>

    <div class="scen-grid">
      <div v-for="s in scenList" :key="s.slug" class="scen" :class="{ checked: picked.includes(s.slug) }" @click="toggle(s.slug)">
        <span class="check">{{ picked.includes(s.slug) ? '✓' : '' }}</span>
        <div class="scen-title">{{ s.title }}</div>
        <div class="scen-desc">{{ s.desc }}</div>
        <div class="meta-row">
          <span class="tag tactic">{{ s.tactic }}</span>
          <span class="tag">{{ s.technique }}</span>
          <span class="tag" :class="s.severity === '高危' ? 'sev-high' : ''">{{ s.severity }}</span>
        </div>
      </div>
    </div>

    <div v-if="lastRun" class="result-summary" style="margin-top: 24px">
      <div class="chip"><div class="label">本次场景</div><div class="value">{{ lastRun.total }}</div></div>
      <div class="chip hit"><div class="label">检出</div><div class="value">{{ lastRun.detected }}</div></div>
      <div class="chip miss"><div class="label">漏检缺口</div><div class="value">{{ lastRun.missed }}</div></div>
      <div class="chip cov"><div class="label">覆盖率</div><div class="value">{{ lastRun.coverage }}%</div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api.js';

const router = useRouter();
const scenList = ref([]);
const picked = ref([]);
const lastRun = ref(null);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const data = await api.scenarios();
    scenList.value = data.items;
  } catch (e) {
    error.value = e.message;
  }
});

function toggle(slug) {
  picked.value = picked.value.includes(slug)
    ? picked.value.filter((x) => x !== slug)
    : [...picked.value, slug];
}

function checkAll(slugs) {
  picked.value = [...slugs];
}

async function run() {
  loading.value = true;
  error.value = '';
  try {
    lastRun.value = await api.createRun(picked.value);
    router.push({ name: 'runs', query: { last: lastRun.value.id } });
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>