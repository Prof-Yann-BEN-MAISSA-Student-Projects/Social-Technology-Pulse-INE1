import { Router } from 'express';
import { Item } from '../models/item.model.js';
import { isConnected } from '../services/db.js';

const router = Router();

function requireDB(req, res, next) {
  if (!isConnected()) return res.status(503).json({ error: 'MongoDB non disponible' });
  next();
}

function applyFilters(match, req) {
  if (req.query.country && req.query.country !== 'all') match.country = req.query.country;
  if (req.query.source) match.source = req.query.source;
  return match;
}

// GET /api/stats/heatmap?days=7&country=FR
router.get('/heatmap', requireDB, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days ?? '7', 10), 30);
    const since = new Date(Date.now() - days * 86_400_000);
    const match = applyFilters({ createdAt: { $gte: since } }, req);

    const cells = await Item.aggregate([
      { $match: match },
      {
        $group: {
          _id: { dow: { $dayOfWeek: '$createdAt' }, hour: { $hour: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, dow: '$_id.dow', hour: '$_id.hour', count: 1 } },
    ]);

    res.json({ cells });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/hourly?source=reddit&days=1
router.get('/hourly', requireDB, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days ?? '1', 10), 30);
    const since = new Date(Date.now() - days * 86_400_000);
    const match = applyFilters({ createdAt: { $gte: since } }, req);

    const rows = await Item.aggregate([
      { $match: match },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $project: { _id: 0, hour: '$_id', count: 1 } },
      { $sort: { hour: 1 } },
    ]);

    res.json({ hours: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/source/:source
const SOURCE_FIELD = {
  reddit:     'meta.subreddit',
  github:     'meta.language',
  hackernews: 'meta.author',
};

router.get('/source/:source', requireDB, async (req, res) => {
  try {
    const { source } = req.params;
    if (!(source in SOURCE_FIELD)) {
      return res.status(400).json({ error: `Source inconnue. Valeurs : ${Object.keys(SOURCE_FIELD).join(', ')}` });
    }
    const match = { source };
    const field = `$${SOURCE_FIELD[source]}`;

    const [summary] = await Item.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$score' } } },
    ]);

    const breakdown = await Item.aggregate([
      { $match: match },
      { $group: { _id: field, count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 7 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);

    const docs = await Item.find(match).sort({ score: -1 }).limit(24).lean();
    const recent = docs.map((d) => ({
      id:        d.externalId,
      title:     d.title,
      url:       d.url,
      score:     d.score,
      source:    d.source,
      keywords:  d.keywords ?? [],
      meta:      d.meta,
      fetchedAt: d.fetchedAt,
    }));

    res.json({
      total:    summary?.total ?? 0,
      avgScore: Math.round(summary?.avgScore ?? 0),
      breakdown,
      recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
