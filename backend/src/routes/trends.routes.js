import { Router } from 'express';
import { getAll, getBySource, getTopN } from '../services/store.js';

const router = Router();

// GET /api/trends — tout le store
router.get('/', (_req, res) => {
  res.json(getAll());
});

// GET /api/trends/top?n=50 — top N toutes sources confondues
router.get('/top', (req, res) => {
  const n = Math.min(parseInt(req.query.n ?? '50', 10), 200);
  res.json(getTopN(n));
});

// GET /api/trends/:source — reddit | hackernews | github
router.get('/:source', (req, res) => {
  const { source } = req.params;
  const allowed = ['reddit', 'hackernews', 'github'];
  if (!allowed.includes(source)) {
    return res.status(400).json({ error: `Source inconnue. Valeurs : ${allowed.join(', ')}` });
  }
  res.json(getBySource(source));
});

export default router;
