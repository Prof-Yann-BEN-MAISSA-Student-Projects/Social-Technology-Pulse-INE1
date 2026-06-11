import { Item } from '../../models/item.model.js';
import { Snapshot } from '../../models/snapshot.model.js';

const HOUR = 3_600_000;
export async function buildKeywordSeries({ hours = 24 } = {}) {
  const start = new Date(Date.now() - hours * HOUR);
  const items = await Item.find({}, { externalId: 1, keywords: 1, source: 1 }).lean();
  const meta = new Map(items.map((i) => [i.externalId, { keywords: i.keywords ?? [], source: i.source }]));
  const rows = await Snapshot.aggregate([
    { $match: { fetchedAt: { $gte: start } } },
    {
      $group: {
        _id: {
          id: '$externalId',
          h:  { $dateToString: { format: '%Y-%m-%dT%H:00:00.000Z', date: '$fetchedAt' } },
        },
        score: { $max: '$score' },
      },
    },
  ]);
  const srcMax = {};
  for (const r of rows) {
    const m = meta.get(r._id.id);
    if (!m) continue;
    srcMax[m.source] = Math.max(srcMax[m.source] ?? 1, r.score || 0);
  }
  const norm = (score, source) =>
    Math.log1p(Math.max(0, score || 0)) / Math.log1p(srcMax[source] || 1);

  const byKw = new Map(); 
  for (const r of rows) {
    const m = meta.get(r._id.id);
    if (!m || !m.keywords.length) continue;
    const t = Date.parse(r._id.h);
    const v = norm(r.score, m.source);
    for (const kw of m.keywords) {
      if (!byKw.has(kw)) byKw.set(kw, new Map());
      const hm = byKw.get(kw);
      hm.set(t, (hm.get(t) ?? 0) + v);
    }
  }
  const series = {};
  for (const [kw, hm] of byKw) {
    series[kw] = [...hm.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, v]) => ({ t: +((ts - start.getTime()) / HOUR).toFixed(2), v: +v.toFixed(2) }));
  }

  const buckets = new Set(rows.map((r) => r._id.h)).size;
  return { series, hours, buckets };
}
