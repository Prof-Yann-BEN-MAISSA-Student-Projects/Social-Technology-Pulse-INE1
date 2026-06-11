import { useMemo } from 'react';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip,
} from 'recharts';
import { Icon } from '../lib/ui';
import { SOURCE_META } from '../lib/domains';

const SOURCES = ['reddit', 'hackernews', 'github'];
const COLORS = ['#818cf8', '#fbbf24', '#34d399', '#f472b6'];

export default function RadarCompare({ keywords, selected }) {
  const { data, names } = useMemo(() => {
    const byName = new Map(keywords.map((k) => [k.keyword, k]));
    const names = selected.filter((n) => (byName.get(n)?.count ?? 0) > 0).slice(0, 4);

    const data = SOURCES.map((s) => {
      const row = { source: SOURCE_META[s].short };
      for (const n of names) {
        const k = byName.get(n);
        row[n] = k.count ? +((100 * (k.bySource?.[s] ?? 0)) / k.count).toFixed(1) : 0;
      }
      return row;
    });
    return { data, names };
  }, [keywords, selected]);

  return (
    <div className="panel p-5 fade-up-d3 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
          <Icon name="Radar" size={16} className="text-indigo-300" />
          Profil par source
        </h3>
        <p className="text-xs text-gray-400">
          Répartition des mentions de chaque techno entre les 3 sources (en %) · sélectionne des barres du classement
        </p>
      </div>

      <div className="w-full flex-1 min-h-0" style={{ minHeight: 320 }}>
        {names.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            Sélectionne une ou plusieurs technos dans le classement.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis dataKey="source" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5}
                tick={{ fill: '#6b7280', fontSize: 9 }} tickFormatter={(v) => `${v}%`} axisLine={false} />
              {names.map((n, i) => (
                <Radar key={n} name={n} dataKey={n}
                  stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>} />
              <Tooltip
                contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(value, name) => [`${value}%`, name]} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
