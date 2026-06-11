import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Icon } from '../lib/ui';
import { fetchHistory } from '../lib/api';

const COLORS = ['#818cf8', '#22d3ee', '#f59e0b', '#34d399', '#f472b6'];

export default function HistoryChart({ keywords, days = 14, country = 'all' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!keywords.length) { setData([]); return; }
    (async () => {
      setLoading(true);
      try {
        const hist = await Promise.all(keywords.map((kw) => fetchHistory(kw, { days, country })));
        const byDate = new Map();
        keywords.forEach((kw, i) => {
          for (const p of hist[i]) {
            if (!byDate.has(p.date)) byDate.set(p.date, { date: p.date });
            byDate.get(p.date)[kw] = p.count;
          }
        });
        const merged = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
        if (!cancelled) setData(merged);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [keywords.join(','), days, country]);

  return (
    <div className="panel p-5 fade-up-d3 h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2 mb-1">
        <Icon name="LineChart" size={16} className="text-indigo-300" />
        Évolution comparée
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Mentions/jour sur {days}j. {keywords.length ? `Comparaison : ${keywords.join(', ')}.` : 'Clique des technos dans le classement.'}
      </p>

      <div className="flex-1 min-h-0" style={{ minHeight: 240 }}>
      {loading && <p className="text-gray-500 text-sm h-full flex items-center justify-center">Chargement…</p>}
      {!loading && data.length === 0 && (
        <p className="text-gray-600 text-sm h-full flex items-center justify-center">Historique en cours d’accumulation.</p>
      )}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#1f2937' }} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#e5e7eb' }} />
            <Legend formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>} />
            {keywords.map((kw, i) => (
              <Line key={kw} type="monotone" dataKey={kw} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
      </div>
    </div>
  );
}
