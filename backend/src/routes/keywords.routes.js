import { Router } from 'express';
import { Item } from '../models/item.model.js';
import { isConnected } from '../services/db.js';

const router = Router();

function requireDB(req, res, next) {
  if (!isConnected()) {
    return res.status(503).json({ error: 'MongoDB non disponible — historique inaccessible' });
  }
  next();
}

// GET /api/keywords/top?limit=20&hours=24&source=reddit
// Top mots-clés par nombre de mentions dans la fenêtre temporelle
router.get('/top', requireDB, async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    const hours  = Math.min(parseInt(req.query.hours ?? '24', 10), 720);
    const since  = new Date(Date.now() - hours * 3_600_000);
    const match  = { fetchedAt: { $gte: since } };
    if (req.query.source) match.source = req.query.source;

    const results = await Item.aggregate([
      { $match: match },
      { $unwind: '$keywords' },
      {
        $group: {
          _id:        '$keywords',
          count:      { $sum: 1 },
          totalScore: { $sum: '$score' },
          sources:    { $addToSet: '$source' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id:        0,
          keyword:    '$_id',
          count:      1,
          totalScore: 1,
          sources:    1,
        },
      },
    ]);

    res.json({ window: `${hours}h`, total: results.length, keywords: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/keywords/trending?limit=20
// Mots-clés en hausse : compare les 24h les plus récentes vs les 24h précédentes
router.get('/trending', requireDB, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    const now   = Date.now();
    const DAY   = 86_400_000;

    const [recent, previous] = await Promise.all([
      aggregateWindow(new Date(now - DAY),     new Date(now)),
      aggregateWindow(new Date(now - 2 * DAY), new Date(now - DAY)),
    ]);

    const prevMap = new Map(previous.map((k) => [k.keyword, k.count]));

    const trending = recent
      .map((k) => {
        const prev   = prevMap.get(k.keyword) ?? 0;
        const delta  = k.count - prev;
        const growth = prev > 0
          ? +((delta / prev) * 100).toFixed(1)
          : null;
        return { ...k, prevCount: prev, delta, growth };
      })
      .filter((k) => k.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, limit);

    res.json({ trending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/keywords/:kw/history?days=7
// Évolution journalière d'un mot-clé sur N jours
router.get('/:kw/history', requireDB, async (req, res) => {
  try {
    const days  = Math.min(parseInt(req.query.days ?? '7', 10), 30);
    const since = new Date(Date.now() - days * 86_400_000);

    const history = await Item.aggregate([
      { $match: { keywords: req.params.kw, fetchedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fetchedAt' } },
          count:    { $sum: 1 },
          avgScore: { $avg: '$score' },
          sources:  { $addToSet: '$source' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id:      0,
          date:     '$_id',
          count:    1,
          avgScore: { $round: ['$avgScore', 0] },
          sources:  1,
        },
      },
    ]);

    res.json({ keyword: req.params.kw, days, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function aggregateWindow(from, to) {
  return Item.aggregate([
    { $match: { fetchedAt: { $gte: from, $lt: to } } },
    { $unwind: '$keywords' },
    { $group: { _id: '$keywords', count: { $sum: 1 } } },
    { $project: { _id: 0, keyword: '$_id', count: 1 } },
  ]);
}

export default router;
