import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import trendsRouter from './src/routes/trends.routes.js';
import keywordsRouter from './src/routes/keywords.routes.js';
import { startPollers } from './src/workers/poller.js';
import { connectDB } from './src/services/db.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trends', trendsRouter);
app.use('/api/keywords', keywordsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// eslint-disable-next-line no-unused-vars
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
