import { Router } from 'express';
import { getAll, getBySource, getTopN } from '../services/store.js';

const router = Router();

const ALLOWED_SOURCES = ['reddit', 'hackernews', 'github'];

// GET /api/trends — tout le store
router.get('/', (_req, res) => {
  res.json(getAll());
});

// GET /api/trends/top?n=50&keyword=react
router.get('/top', (req, res) => {
  const n       = Math.min(parseInt(req.query.n ?? '50', 10), 200);
  const keyword = req.query.keyword ?? null;
  res.json(getTopN(n, { keyword }));
});

// GET /api/trends/:source?keyword=react
router.get('/:source', (req, res) => {
  const { source } = req.params;
  if (!ALLOWED_SOURCES.includes(source)) {
    return res.status(400).json({ error: `Source inconnue. Valeurs : ${ALLOWED_SOURCES.join(', ')}` });
  }
  const keyword = req.query.keyword ?? null;
  res.json(getBySource(source, { keyword }));
});

export default router;
