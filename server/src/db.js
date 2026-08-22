// 数据库层：SQLite 存储场景 / 规则 / 验证任务 / 命中结果
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || join(__dirname, '..', 'data');

export const db = new DatabaseSync(join(dataDir, 'lab.db'));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenarios TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS run_findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    scenario TEXT NOT NULL,
    title TEXT NOT NULL,
    expected INTEGER NOT NULL,
    matched INTEGER NOT NULL,
    rule TEXT,
    detail TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_findings_run ON run_findings(run_id);
`);

export function resetRuns() {
  db.exec('DELETE FROM run_findings; DELETE FROM runs;');
}