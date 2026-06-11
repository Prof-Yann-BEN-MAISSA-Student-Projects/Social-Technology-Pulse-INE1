import { useMemo, useState } from 'react';
import { Icon } from '../lib/ui';
import { SOURCE_META, dominantSource } from '../lib/domains';

const W = 760, H = 320;
const PAD = { top: 16, right: 20, bottom: 38, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function logTicks(min, max) {
  const ticks = [];
  const start = Math.floor(Math.log10(min));
  const end = Math.ceil(Math.log10(max));
  for (let e = start; e <= end; e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= min && v <= max) ticks.push(v);
    }
  }
  return ticks.length ? ticks : [min, max];
}

function linTicks(max, n = 4) {
  return Array.from({ length: n + 1 }, (_, i) => Math.round((max * i) / n));
}

function fmt(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return `${Math.round(v)}`;
}

export default function BubbleChart({ keywords, onPick }) {
  const points = useMemo(() => {
    const data = keywords
      .slice(0, 22)
      .map((k) => {
        const count = k.count ?? 0;
        const total = k.totalScore ?? 0;
        return {
          kw: k.keyword,
          count,                                   
          avg: count > 0 ? total / count : 0,   
          total,                                   
          source: dominantSource(k.bySource),
        };
      })
      .filter((d) => d.count > 0 && d.avg > 0);

    if (!data.length) return { items: [], xMax: 1, yMin: 1, yMax: 1, maxTotal: 1 };

    const xMax = Math.max(...data.map((d) => d.count));
    const yMin = Math.max(1, Math.min(...data.map((d) => d.avg)));
    const yMax = Math.max(...data.map((d) => d.avg));
    const maxTotal = Math.max(...data.map((d) => d.total));

    const xScale = (v) => PAD.left + (v / xMax) * PLOT_W;
    const logSpan = Math.log10(yMax) - Math.log10(yMin) || 1;
    const yScale = (v) =>
      PAD.top + PLOT_H - ((Math.log10(v) - Math.log10(yMin)) / logSpan) * PLOT_H;

    const nodes = data.map((d) => {
      const tx = xScale(d.count);
      const ty = yScale(d.avg);
      return { ...d, tx, ty, x: tx, y: ty, r: 6 + Math.sqrt(d.total / maxTotal) * 20 };
    });
    for (let iter = 0; iter < 300; iter++) {
      for (const n of nodes) {
        n.x += (n.tx - n.x) * 0.06;
        n.y += (n.ty - n.y) * 0.06;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minD = a.r + b.r + 3;
          if (dist < minD) {
            const push = (minD - dist) / 2;
            const ux = dx / dist, uy = dy / dist;
            a.x -= ux * push; a.y -= uy * push;
            b.x += ux * push; b.y += uy * push;
          }
        }
      }
      for (const n of nodes) {
        n.x = Math.max(PAD.left + n.r, Math.min(W - PAD.right - n.r, n.x));
        n.y = Math.max(PAD.top + n.r, Math.min(H - PAD.bottom - n.r, n.y));
      }
    }

    return { items: nodes, xMax, yMin, yMax, maxTotal };
  }, [keywords]);

  const [hover, setHover] = useState(null);
  const { items, xMax, yMin, yMax } = points;

  const xS = (v) => PAD.left + (v / xMax) * PLOT_W;
  const logSpan = Math.log10(yMax) - Math.log10(yMin) || 1;
  const yS = (v) =>
    PAD.top + PLOT_H - ((Math.log10(Math.max(1, v)) - Math.log10(yMin)) / logSpan) * PLOT_H;

  return (
    <div className="panel p-5 fade-up-d3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="CircleDot" size={16} className="text-indigo-300" />
            Volume vs. engagement
          </h3>
          <p className="text-xs text-gray-400">
            X = mentions · Y = score moyen (log) · taille = portée totale · couleur = source · clique pour le détail
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          {Object.entries(SOURCE_META).map(([k, m]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />{m.short}
            </span>
          ))}
        </div>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Pas encore de données.</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
            {logTicks(yMin, yMax).map((t) => {
              const gy = yS(t);
              return (
                <g key={`y${t}`}>
                  <line x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy} stroke="#1f2937" strokeDasharray="3 3" />
                  <text x={PAD.left - 8} y={gy + 3} textAnchor="end" fontSize="9" fill="#6b7280" className="tabular-nums">{fmt(t)}</text>
                </g>
              );
            })}
            {linTicks(xMax).map((t) => {
              const gx = xS(t);
              return (
                <g key={`x${t}`}>
                  <line x1={gx} y1={PAD.top} x2={gx} y2={H - PAD.bottom} stroke="#1f2937" strokeDasharray="3 3" />
                  <text x={gx} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#6b7280" className="tabular-nums">{t}</text>
                </g>
              );
            })}
            <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">Volume (mentions)</text>
            <text x={14} y={PAD.top + PLOT_H / 2} textAnchor="middle" fontSize="10" fill="#9ca3af" transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}>Score moyen</text>

            {items.map((b) => {
              const color = SOURCE_META[b.source].color;
              return (
                <g key={b.kw} className="bubble"
                   onMouseEnter={() => setHover(b)} onMouseLeave={() => setHover(null)}
                   onClick={() => onPick(b.kw)}>
                  <circle cx={b.x} cy={b.y} r={b.r} fill={color} fillOpacity="0.16" stroke={color} strokeOpacity="0.6" strokeWidth="1.25" />
                  <text x={b.x} y={b.y + 3} textAnchor="middle" fontSize={Math.min(12, Math.max(8, b.r * 0.5))} fill="#e5e7eb" fontWeight="500" pointerEvents="none">{b.kw}</text>
                </g>
              );
            })}
          </svg>
        )}

        {hover && (
          <div className="absolute pointer-events-none rounded-lg border border-gray-700 bg-[#0d1320]/95 backdrop-blur px-3 py-2 text-xs"
               style={{ left: `${hover.x / W * 100}%`, top: `${hover.y / H * 100}%`, transform: 'translate(-50%, calc(-100% - 14px))' }}>
            <div className="font-medium text-gray-100">{hover.kw}</div>
            <div className="text-gray-400 tabular-nums">
              {hover.count} mentions · score moy. {fmt(hover.avg)} · {SOURCE_META[hover.source].short}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
