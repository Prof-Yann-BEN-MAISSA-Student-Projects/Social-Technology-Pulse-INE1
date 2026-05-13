import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import trendsRouter from './routes/trends.routes.js';
import { startPollers } from './workers/poller.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trends', trendsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  startPollers();
});
