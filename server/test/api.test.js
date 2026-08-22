// 端到端接口测试：node --test（纯离线数据模拟，全程无网络扫描/发包）
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/index.js';
import { resetRuns } from '../src/db.js';

let server;
let base;

before(async () => {
  resetRuns();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

test('健康检查', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
});

test('场景库共 12 个场景', async () => {
  const data = await (await fetch(`${base}/scenarios`)).json();
  assert.equal(data.total, 12);
  assert.ok(data.items.every((s) => s.slug && s.alerts && s.alerts.length > 0));
});

test('规则库共 12 条规则', async () => {
  const data = await (await fetch(`${base}/rules`)).json();
  assert.equal(data.items.length, 12);
});

test('非法参数被拒绝', async () => {
  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenarios: [] }),
  });
  assert.equal(res.status, 400);
});

test('未知场景被拒绝', async () => {
  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenarios: ['not-exist'] }),
  });
  assert.equal(res.status, 400);
});

test('全场景验证：12 场景，10 命中 2 缺口', async () => {
  const all = (await (await fetch(`${base}/scenarios`)).json()).items.map((s) => s.slug);
  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenarios: all }),
  });
  assert.equal(res.status, 201);
  const run = await res.json();
  assert.equal(run.total, 12);
  assert.equal(run.detected, 10);
  assert.equal(run.missed, 2);
  assert.equal(run.coverage, 83);
});

test('漏检的两个场景是编码绕过与 DNS 隧道', async () => {
  const all = (await (await fetch(`${base}/scenarios`)).json()).items.map((s) => s.slug);
  const run = await (
    await fetch(`${base}/runs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenarios: all }),
    })
  ).json();
  const missed = run.findings.filter((f) => !f.matched).map((f) => f.scenario).sort();
  assert.deepEqual(missed, ['dns-tunnel', 'xss-encoded']);
});

test('单场景验证：SQL 注入命中', async () => {
  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scenarios: ['sqli-union'] }),
  });
  const run = await res.json();
  assert.equal(run.detected, 1);
  assert.equal(run.missed, 0);
  assert.equal(run.coverage, 100);
});

test('任务列表与详情', async () => {
  const runs = await (await fetch(`${base}/runs`)).json();
  assert.ok(runs.items.length >= 3);
  const detail = await (await fetch(`${base}/runs/${runs.items[0].id}`)).json();
  assert.ok(detail.findings.length > 0);
});

test('汇总报告含缺口说明', async () => {
  const report = await (await fetch(`${base}/report`)).json();
  assert.equal(report.total, 12);
  assert.equal(report.missed, 2);
  assert.equal(report.gaps.length, 2);
  assert.ok(report.byTactic.length > 0);
});

test('查询不存在的任务返回 404', async () => {
  const res = await fetch(`${base}/runs/999999`);
  assert.equal(res.status, 404);
});