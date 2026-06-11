import { buildKeywordSeries } from './dataset.js';
import * as baseline from './models/baseline.js';
import * as lstm from './models/lstm.js';

const MODELS = { baseline, lstm };
const WINDOW_HOURS = 24 * 14;

export async function getRising({ horizon = 6, limit = 8, model = 'baseline' } = {}) {
  const m = MODELS[model] ?? baseline;
  const { series, buckets } = await buildKeywordSeries({ hours: WINDOW_HOURS });

  let entries = Object.entries(series);
  if (m.name === 'lstm') {
    entries = entries.sort((a, b) => b[1].length - a[1].length).slice(0, 15);
  }

  const scored = [];
  let standby = 0;
  for (const [keyword, points] of entries) {
    const pred = await m.predict(points, horizon);
    if (pred.status === 'standby') { standby++; continue; }
    if (pred.status !== 'ok') continue;
    const current = points[points.length - 1]?.v ?? 0;
    scored.push({ keyword, current: +current.toFixed(1), points: points.length, ...pred });
  }

  const rising = scored
    .filter((s) => s.velocityPct > 0)
    .sort((a, b) => b.velocityPct - a.velocityPct)
    .slice(0, limit);

  const fading = scored
    .filter((s) => s.velocityPct < 0)
    .sort((a, b) => a.velocityPct - b.velocityPct)
    .slice(0, limit);

  const dormant = scored.length === 0 && standby > 0;
  const maturity = {
    model: m.name ?? model,
    horizon,
    hoursCovered: buckets,
    analyzed: scored.length,
    minDataPoints: m.minDataPoints,
    enough: scored.length > 0,
    note: dormant
      ? `Modèle ${m.name} en veille — il s'activera dès ~${m.minDataPoints} points par série (historique actuel : ${buckets} h). La baseline reste disponible.`
      : buckets < 12
        ? `Historique court (${buckets} h) — prédictions indicatives, la fiabilité augmente avec le temps.`
        : `${buckets} h d'historique exploité (${scored.length} mots-clés).`,
  };

  return { maturity, rising, fading };
}
