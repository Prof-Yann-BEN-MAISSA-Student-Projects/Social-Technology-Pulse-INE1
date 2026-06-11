import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../lib/ui';
import { fetchHeatmap } from '../lib/api';

const DAYS = [
  { label: 'Lun', dow: 2 }, { label: 'Mar', dow: 3 }, { label: 'Mer', dow: 4 },
  { label: 'Jeu', dow: 5 }, { label: 'Ven', dow: 6 }, { label: 'Sam', dow: 7 },
  { label: 'Dim', dow: 1 },
];

export default function ActivityHeatmap({ country = 'all' }) {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchHeatmap({ days: 7, country }).then((c) => !cancelled && setCells(c)).catch(() => {});
    return () => { cancelled = true; };
  }, [country]);

  const { grid, max } = useMemo(() => {
    const g = {};
    let m = 0;
    for (const c of cells) {
      g[`${c.dow}-${c.hour}`] = c.count;
      if (c.count > m) m = c.count;
    }
    return { grid: g, max: m };
  }, [cells]);

  const cellColor = (v) => {
    if (!v) return '#0f1626';
    const t = Math.min(1, v / (max || 1));
    const r = Math.round(99 + (236 - 99) * t);
    const g = Math.round(102 + (72 - 102) * t);
    const b = Math.round(241 + (153 - 241) * t);
    return `rgba(${r},${g},${b},${0.18 + t * 0.82})`;
  };

  const [tip, setTip] = useState(null);

  return (
    <div className="panel p-5 fade-up-d3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="LayoutGrid" size={16} className="text-indigo-300" />
            Heatmap d'activité
          </h3>
          <p className="text-xs text-gray-400">Items collectés par heure × jour · 7 derniers jours (données réelles)</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>0</span>
          <div className="flex">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <span key={t} className="w-3.5 h-2.5" style={{ background: cellColor(t * (max || 1)) }} />
            ))}
          </div>
          <span>max</span>
        </div>
      </div>

      {max === 0 && (
        <p className="text-[11px] text-gray-600 mb-3">
          Encore peu de données — la heatmap se remplit au fil des collectes.
        </p>
      )}

      <div className="relative">
        <div className="grid gap-1" style={{ gridTemplateColumns: '32px repeat(24, minmax(0,1fr))' }}>
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className={`text-[9px] text-gray-600 mono text-center ${h % 3 === 0 ? '' : 'invisible'}`}>{h}h</div>
          ))}
          {DAYS.map((d) => (
            <div key={d.label} className="contents">
              <div className="text-[10px] text-gray-500 mono flex items-center">{d.label}</div>
              {Array.from({ length: 24 }).map((_, hi) => {
                const v = grid[`${d.dow}-${hi}`] ?? 0;
                return (
                  <div key={hi} className="hm-cell rounded-[3px] aspect-square"
                       style={{ background: cellColor(v) }}
                       onMouseEnter={() => setTip({ d: d.label, h: hi, v })}
                       onMouseLeave={() => setTip(null)} />
                );
              })}
            </div>
          ))}
        </div>
        {tip && (
          <div className="absolute top-0 right-0 text-[11px] mono px-2.5 py-1.5 rounded-md border border-gray-700 bg-[#0d1320]/95">
            <span className="text-gray-100">{tip.d} {tip.h}h</span>
            <span className="text-gray-400"> · </span>
            <span className="text-indigo-300 font-medium">{tip.v} items</span>
          </div>
        )}
      </div>
    </div>
  );
}
