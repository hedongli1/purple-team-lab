// 场景/规则数据加载 & 验证任务执行（纯离线数据模拟，不发起任何真实网络行为）
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchScenario } from './rulesEngine.js';
import { db } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const scenarios = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'scenarios.json'), 'utf8'));
export const rules = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'rules.json'), 'utf8'));

export function listScenarios() {
  return scenarios;
}

export function listRules() {
  return rules.map((r) => ({ slug: r.slug, title: r.title, scenario: r.scenario, level: r.level }));
}

/**
 * 执行一次验证任务：
 * 对选中的每个场景，把其「模拟告警样本」喂给对应检测规则，
 * 记录命中 / 漏检（检测缺口）结果。
 */
export function runScenarios(slugs) {
  const selected = scenarios.filter((s) => slugs.includes(s.slug));
  const results = selected.map((s) => {
    const rule = rules.find((r) => r.slug === s.rule);
    const outcome = matchScenario(s.alerts, rule);
    return {
      scenario: s.slug,
      title: s.title,
      tactic: s.tactic,
      technique: s.technique,
      severity: s.severity,
      expected: 1, // 全部为真实攻击模拟，都应被检出
      matched: outcome.matched ? 1 : 0,
      rule: outcome.rule,
      detail: outcome.matched
        ? `已命中规则「${rule.title}」，检测能力有效`
        : '检测缺口：现有规则未命中该场景，建议补充检测能力',
    };
  });

  const insertRun = db.prepare('INSERT INTO runs (scenarios) VALUES (?)');
  const runInfo = insertRun.run(JSON.stringify(slugs));
  const runId = Number(runInfo.lastInsertRowid);

  const insertFinding = db.prepare(
    'INSERT INTO run_findings (run_id, scenario, title, expected, matched, rule, detail) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const r of results) {
    insertFinding.run(runId, r.scenario, r.title, r.expected, r.matched, r.rule, r.detail);
  }

  const detected = results.filter((r) => r.matched).length;
  return {
    id: runId,
    total: results.length,
    detected,
    missed: results.length - detected,
    coverage: results.length ? Math.round((detected / results.length) * 100) : 0,
    findings: results,
  };
}

export function getRun(id) {
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(id);
  if (!run) return null;
  const findings = db.prepare('SELECT * FROM run_findings WHERE run_id = ? ORDER BY id').all(id);
  const detected = findings.filter((f) => f.matched).length;
  return {
    id: run.id,
    created_at: run.created_at,
    scenarios: JSON.parse(run.scenarios),
    total: findings.length,
    detected,
    missed: findings.length - detected,
    coverage: findings.length ? Math.round((detected / findings.length) * 100) : 0,
    findings,
  };
}

export function listRuns() {
  return db
    .prepare(
      `SELECT r.id, r.created_at, r.scenarios,
              SUM(f.matched) AS detected, COUNT(f.id) AS total
       FROM runs r LEFT JOIN run_findings f ON f.run_id = r.id
       GROUP BY r.id ORDER BY r.id DESC LIMIT 50`
    )
    .all()
    .map((r) => ({
      id: r.id,
      created_at: r.created_at,
      scenarios: JSON.parse(r.scenarios),
      total: r.total,
      detected: r.detected ?? 0,
      missed: r.total - (r.detected ?? 0),
      coverage: r.total ? Math.round(((r.detected ?? 0) / r.total) * 100) : 0,
    }));
}

// 汇总报告：基于最近一次任务（或全部任务聚合）
export function buildReport() {
  const findings = db.prepare('SELECT * FROM run_findings ORDER BY id').all();
  const runIds = [...new Set(findings.map((f) => f.run_id))];
  if (runIds.length === 0) {
    return { runs: 0, total: 0, detected: 0, missed: 0, coverage: 0, byTactic: [], gaps: [] };
  }
  // 取每个场景最近一次结果
  const latest = new Map();
  for (const f of findings) latest.set(f.scenario, f);

  const rows = [...latest.values()];
  const detectedCount = rows.filter((f) => f.matched).length;
  const gaps = rows.filter((f) => !f.matched).map((f) => ({ scenario: f.scenario, title: f.title, detail: f.detail }));

  return {
    runs: runIds.length,
    total: rows.length,
    detected: detectedCount,
    missed: rows.length - detectedCount,
    coverage: rows.length ? Math.round((detectedCount / rows.length) * 100) : 0,
    byTactic: buildTacticBreakdown(rows),
    gaps,
  };
}

function buildTacticBreakdown(findings) {
  const map = {};
  for (const f of findings) {
    const t = tacticOf(f.scenario);
    map[t] ||= { tactic: t, total: 0, detected: 0 };
    map[t].total += 1;
    if (f.matched) map[t].detected += 1;
  }
  return Object.values(map);
}

function tacticOf(scenario) {
  const s = scenarios.find((x) => x.slug === scenario);
  return s ? s.tactic : '未知';
}