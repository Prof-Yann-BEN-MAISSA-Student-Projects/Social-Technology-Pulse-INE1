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

// GET /api/keywords/top?limit=30&hours=168&source=reddit&country=FR
router.get('/top', requireDB, async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit ?? '30', 10), 100);
    const hours  = Math.min(parseInt(req.query.hours ?? '168', 10), 720);
    const since  = new Date(Date.now() - hours * 3_600_000);
    const match  = { fetchedAt: { $gte: since } };
    if (req.query.source)  match.source  = req.query.source;
    if (req.query.country) match.country = req.query.country;

    // Max de score par source pour normaliser 
    const maxRows = await Item.aggregate([
      { $match: match },
      { $group: { _id: '$source', max: { $max: '$score' } } },
    ]);
    const srcMax = { reddit: 1, hackernews: 1, github: 1 };
    for (const r of maxRows) if (r._id in srcMax) srcMax[r._id] = r.max || 1;

    // Score normalisé 
    const normScore = {
      $let: {
        vars: {
          m: { $switch: { branches: [
            { case: { $eq: ['$source', 'reddit'] },     then: srcMax.reddit },
            { case: { $eq: ['$source', 'hackernews'] }, then: srcMax.hackernews },
            { case: { $eq: ['$source', 'github'] },     then: srcMax.github },
          ], default: 1 } },
        },
        in: {
          $cond: [
            { $gt: ['$$m', 0] },
            { $multiply: [100, { $divide: [
              { $ln: { $add: [{ $max: ['$score', 0] }, 1] } },
              { $ln: { $add: ['$$m', 1] } },
            ] }] },
            0,
          ],
        },
      },
    };

    const rows = await Item.aggregate([
      { $match: match },
      { $addFields: { normScore } },
      { $unwind: '$keywords' },
      // 1er regroupement : (mot-clé, source)
      {
        $group: {
          _id:   { kw: '$keywords', source: '$source' },
          count: { $sum: 1 },
          score: { $sum: '$normScore' },
        },
      },
      // 2e regroupement : mot-clé global
      {
        $group: {
          _id:        '$_id.kw',
          count:      { $sum: '$count' },
          totalScore: { $sum: '$score' },
          sources:    { $addToSet: '$_id.source' },
          bySource:   { $push: { source: '$_id.source', count: '$count', score: '$score' } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, keyword: '$_id', count: 1, totalScore: { $round: ['$totalScore', 0] }, sources: 1, bySource: 1 } },
    ]);

    // Normalise bySource en objet { reddit, hackernews, github }
    const keywords = rows.map((k) => {
      const bySource = { reddit: 0, hackernews: 0, github: 0 };
      for (const s of k.bySource) bySource[s.source] = s.count;
      return { ...k, bySource };
    });

    res.json({ window: `${hours}h`, country: req.query.country ?? 'all', total: keywords.length, keywords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/keywords/trending?limit=20
router.get('/trending', requireDB, async (req, res) => {
  try {
    const limit   = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    const country = req.query.country ?? null;
    const DAY     = 86_400_000;

    const dayStr    = (ms) => new Date(ms).toISOString().slice(0, 10);
    const today     = dayStr(Date.now());
    const yesterday = dayStr(Date.now() - DAY);
    const since     = new Date(`${yesterday}T00:00:00.000Z`);

    const match = { createdAt: { $gte: since } };
    if (country) match.country = country;

    const rows = await Item.aggregate([
      { $match: match },
      { $unwind: '$keywords' },
      {
        $group: {
          _id:   { kw: '$keywords', day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          count: { $sum: 1 },
        },
      },
    ]);

    const byKw = new Map();
    for (const r of rows) {
      const o = byKw.get(r._id.kw) ?? { today: 0, prev: 0 };
      if (r._id.day === today)          o.today = r.count;
      else if (r._id.day === yesterday) o.prev  = r.count;
      byKw.set(r._id.kw, o);
    }

    const MIN_PREV = 5;

    const trending = [...byKw.entries()]
      .map(([keyword, o]) => {
        const count = o.today, prev = o.prev;
        const delta = count - prev;
        const growth = prev >= MIN_PREV ? +((delta / prev) * 100).toFixed(1) : null;
        return { keyword, count, prevCount: prev, delta, growth };
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
    const match = { keywords: req.params.kw, createdAt: { $gte: since } };
    if (req.query.country) match.country = req.query.country;

    const history = await Item.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
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

export default router;
