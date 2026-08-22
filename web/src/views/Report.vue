<template>
  <div>
    <h1 class="page-title">检测覆盖报告</h1>
    <p class="page-sub">汇总最近验证结果：哪些攻击手法被检出，哪些存在检测缺口</p>

    <div v-if="!report || report.total === 0" class="empty card">还没有数据，先到「场景库」发起一次验证</div>

    <template v-else>
      <div class="card" style="text-align:center">
        <div class="coverage-ring" :style="ringStyle">
          <div class="num">{{ report.coverage }}%</div>
        </div>
        <div style="color:var(--ink-2);font-size:13px">
          覆盖率 — {{ report.detected }} 检出 / {{ report.missed }} 缺口（共 {{ report.total }} 场景，{{ report.runs }} 轮验证）
        </div>
      </div>

      <div class="card">
        <h2 style="font-size:16px;margin-bottom:14px">按 ATT&CK 战术的检出情况</h2>
        <div v-for="t in report.byTactic" :key="t.tactic" class="tactic-bar">
          <span class="tname">{{ t.tactic }}</span>
          <div class="track"><div class="fill" :style="{ width: (t.total ? Math.round(t.detected / t.total * 100) : 0) + '%' }"></div></div>
          <span style="font-size:13px;color:var(--ink-2)">{{ t.detected }}/{{ t.total }}</span>
        </div>
      </div>

      <div class="card gap-card">
        <h2 style="font-size:16px;margin-bottom:12px;color:#e56b5a">⚠ 检测缺口（漏检场景）</h2>
        <div v-for="g in report.gaps" :key="g.scenario" style="padding:8px 0;border-bottom:1px solid rgba(43,36,24,.6)">
          <div style="font-weight:600">{{ g.title }}</div>
          <div class="detail-dim" style="margin-top:4px">{{ g.detail }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api.js';

const report = ref(null);

onMounted(async () => {
  report.value = await api.report();
});

const ringStyle = computed(() => {
  const c = report.value ? report.value.coverage : 0;
  return {
    background: `conic-gradient(var(--gold) ${c * 3.6}deg, var(--bg-2) 0deg)`,
  };
});
</script>