<template>
  <div>
    <h1 class="page-title">验证任务</h1>
    <p class="page-sub">每次验证：场景模拟告警 → 检测规则匹配 → 命中/漏检结果</p>

    <div class="card">
      <div v-if="!runs.length" class="empty">还没有验证任务，去「场景库」发起一个吧</div>
      <table class="t" v-else>
        <thead>
          <tr>
            <th>#</th><th>时间</th><th>场景数</th><th>检出</th><th>漏检</th><th>覆盖率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in runs" :key="r.id" class="runs-row" @click="open(r.id)">
            <td>{{ r.id }}</td>
            <td>{{ r.created_at }}</td>
            <td>{{ r.total }}</td>
            <td style="color:#35d17a">{{ r.detected }}</td>
            <td style="color:#e56b5a">{{ r.missed }}</td>
            <td style="color:#f5a623">{{ r.coverage }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-if="detail">
      <h2 style="font-size:16px;margin-bottom:12px">任务 #{{ detail.id }} 明细</h2>
      <table class="t">
        <thead>
          <tr><th>场景</th><th>结果</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in detail.findings" :key="f.scenario">
            <td>
              <div style="font-weight:600">{{ f.title }}</div>
              <div class="detail-dim" style="font-size:12px">{{ f.tactic }} · {{ f.technique }} · {{ f.severity }}</div>
            </td>
            <td>
              <span class="pill" :class="f.matched ? 'hit' : 'miss'">{{ f.matched ? '检出' : '漏检' }}</span>
            </td>
            <td class="detail-dim">
              <span v-if="f.matched">规则：{{ f.rule }}</span>
              <span v-else>⚠️ {{ f.detail }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';

const route = useRoute();
const runs = ref([]);
const detail = ref(null);

onMounted(async () => {
  runs.value = (await api.runs()).items;
  if (route.query.last) detail.value = await api.run(Number(route.query.last));
});

async function open(id) {
  detail.value = await api.run(id);
}
</script>