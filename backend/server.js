import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import trendsRouter from './src/routes/trends.routes.js';
import keywordsRouter from './src/routes/keywords.routes.js';
import statsRouter from './src/routes/stats.routes.js';
import { startPollers, getPollerStatus } from './src/workers/poller.js';
import { connectDB, isConnected } from './src/services/db.js';
import { getCounts } from './src/services/store.js';
import { Item } from './src/models/item.model.js';

const SOURCES = ['reddit', 'hackernews', 'github'];

// Compte réel des items par source : depuis MongoDB si dispo , sinon cache en mémoire.
async function realCounts() {
  if (!isConnected()) return getCounts();
  const rows = await Item.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  for (const r of rows) if (r._id in counts) counts[r._id] = r.count;
  return counts;
}

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trends', trendsRouter);
app.use('/api/keywords', keywordsRouter);
app.use('/api/stats', statsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Métriques live pour les KPIs du dashboard
app.get('/api/status', async (_req, res) => {
  try {
    const counts = await realCounts();
    const pollers = getPollerStatus();
    const lastUpdate = Object.values(pollers)
      .map((p) => p.lastSuccess)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
    res.json({
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      pollers,
      lastUpdate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const msg    = err.expose ? err.message : 'Erreur interne du serveur';
  console.error(`[error] ${req.method} ${req.path} —`, err.message);
  res.status(status).json({ error: msg });
});

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    startPollers();
  });
}

main().catch(console.error);
