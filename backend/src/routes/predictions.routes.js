import { Router } from 'express';
import { isConnected } from '../services/db.js';
import { getRising } from '../services/predictions/index.js';

const router = Router();

// GET /api/predictions/rising?horizon=6&limit=8
router.get('/rising', async (req, res) => {
  if (!isConnected()) return res.status(503).json({ error: 'MongoDB non disponible' });
  try {
    const horizon = Math.min(parseInt(req.query.horizon ?? '6', 10), 72);
    const limit   = Math.min(parseInt(req.query.limit ?? '8', 10), 20);
    const model   = ['baseline', 'lstm'].includes(req.query.model) ? req.query.model : 'baseline';
    const data = await getRising({ horizon, limit, model });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
