// 入口：Express 应用组装
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'purple-team-lab' }));
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: '接口不存在' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器内部错误' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT || 3100);
  app.listen(PORT, () => console.log(`purple-team-lab 已启动: http://localhost:${PORT}`));
}