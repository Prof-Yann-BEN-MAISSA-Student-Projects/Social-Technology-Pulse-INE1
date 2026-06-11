import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Icon } from '../lib/ui';
import { fetchHistory } from '../lib/api';
import { fillDailySeries } from '../lib/series';

function MiniSpark({ data }) {
  if (!data || data.length < 2) return <div style={{ width: 90, height: 30 }} />;
  const chart = data.map((v) => ({ v }));
  return (
    <div style={{ width: 90, height: 30 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chart} margin={{ top: 3, right: 0, bottom: 3, left: 0 }}>
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#a78bfa" strokeWidth={2}
                fill="url(#sparkFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TrendingTable({ trending, onOpenKeyword }) {
  const rows = trending.slice(0, 10);

  const [histories, setHistories] = useState({});
  const keys = rows.map((t) => t.keyword).join(',');
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      rows.map((t) =>
        fetchHistory(t.keyword, { days: 14 })
          .then((h) => [t.keyword, fillDailySeries(h, 14).map((d) => d.count)])
          .catch(() => [t.keyword, null])
      )
    ).then((entries) => {
      if (!cancelled) setHistories(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [keys]);
  return (
    <div className="panel p-5 fade-up-d4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-emerald-300" />
            Keywords en hausse
          </h3>
          <p className="text-xs text-gray-400">Mentions d’aujourd’hui vs hier (jours calendaires)</p>
        </div>
        <span className="text-[11px] text-gray-500">Top 10</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-gray-600 text-sm py-8 text-center">Pas encore de tendance détectée (les données s’accumulent).</p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin -mx-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                <th className="text-left font-medium px-2 py-2">#</th>
                <th className="text-left font-medium px-2 py-2">Keyword</th>
                <th className="text-left font-medium px-2 py-2">Croissance (vs hier)</th>
                <th className="text-left font-medium px-2 py-2">Trajectoire</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => {
                const pos = t.delta >= 0;
                const label = t.growth != null ? `${pos ? '+' : ''}${t.growth}%` : `+${t.delta}`;
                const series = histories[t.keyword];
                const sparkData = series && series.length >= 2
                  ? series
                  : [t.prevCount ?? 0, t.count ?? 0];
                return (
                  <tr key={t.keyword} className="border-t border-gray-800/80 hover:bg-white/[0.02] cursor-pointer"
                      onClick={() => onOpenKeyword(t.keyword)}>
                    <td className="px-2 py-2.5 text-gray-500 tabular-nums">{i + 1}</td>
                    <td className="px-2 py-2.5"><span className="text-gray-100 font-medium kw-link">{t.keyword}</span></td>
                    <td className={`px-2 py-2.5 tabular-nums font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{label}</td>
                    <td className="px-2 py-2.5"><MiniSpark data={sparkData} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
