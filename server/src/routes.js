// API 路由
import { Router } from 'express';
import { listScenarios, listRules, runScenarios, getRun, listRuns, buildReport } from './simulator.js';

export const apiRouter = Router();

apiRouter.get('/scenarios', (req, res) => {
  res.json({ items: listScenarios(), total: listScenarios().length });
});

apiRouter.get('/rules', (req, res) => {
  res.json({ items: listRules() });
});

apiRouter.post('/runs', (req, res) => {
  const slugs = (req.body || {}).scenarios;
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return res.status(400).json({ error: 'scenarios 参数必须是非空数组' });
  }
  const known = new Set(listScenarios().map((s) => s.slug));
  const unknown = slugs.filter((s) => !known.has(s));
  if (unknown.length) return res.status(400).json({ error: `未知场景: ${unknown.join(', ')}` });
  try {
    res.status(201).json(runScenarios(slugs));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '执行失败' });
  }
});

apiRouter.get('/runs', (req, res) => res.json({ items: listRuns() }));

apiRouter.get('/runs/:id', (req, res) => {
  const run = getRun(Number(req.params.id));
  if (!run) return res.status(404).json({ error: '任务不存在' });
  res.json(run);
});

apiRouter.get('/report', (req, res) => res.json(buildReport()));