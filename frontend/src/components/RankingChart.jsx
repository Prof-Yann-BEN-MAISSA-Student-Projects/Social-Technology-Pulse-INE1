import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { Icon } from '../lib/ui';
import { SOURCE_META } from '../lib/domains';

const TT = {
  contentStyle: { background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e5e7eb' },
};

export default function RankingChart({ ranked, metric, onSelect, selected = [] }) {
  const data = ranked.slice(0, 12).map((k) => ({
    name: k.keyword,
    reddit: k.bySource?.reddit ?? 0,
    hackernews: k.bySource?.hackernews ?? 0,
    github: k.bySource?.github ?? 0,
    score: k.totalScore,
  }));
  const height = Math.max(260, data.length * 32);

  return (
    <div className="panel p-5 fade-up-d2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
          <Icon name="BarChart2" size={16} className="text-indigo-300" />
          Classement {metric === 'score' ? '(score cumulé)' : '(mentions agrégées)'}
        </h3>
        <span className="text-[11px] text-gray-500">clique une barre pour comparer</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {metric === 'score'
          ? 'Score total accumulé toutes sources confondues.'
          : 'Chaque barre = somme des mentions, décomposée par source.'}
      </p>

      {data.length === 0 ? (
        <p className="text-gray-600 text-sm py-10 text-center">Aucune donnée.</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 6, right: 16 }}>
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#1f2937' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={104} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} cursor={{ fill: '#ffffff08' }} />
            {metric === 'score' ? (
              <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d) => onSelect?.(d.name)}>
                {data.map((d) => <Cell key={d.name} fill={selected.includes(d.name) ? '#c4b5fd' : '#818cf8'} />)}
              </Bar>
            ) : (
              <>
                <Legend formatter={(v) => <span style={{ color: '#9ca3af' }}>{SOURCE_META[v]?.short ?? v}</span>} />
                {['reddit', 'hackernews', 'github'].map((src, i, arr) => (
                  <Bar key={src} dataKey={src} stackId="s" name={src} fill={SOURCE_META[src].color}
                       radius={i === arr.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                       cursor="pointer" onClick={(d) => onSelect?.(d.name)} />
                ))}
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
