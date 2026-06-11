import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Icon } from '../lib/ui';
import { SOURCE_META } from '../lib/domains';
import { fetchSourceStats, fetchTopKeywords, fetchHourly } from '../lib/api';
import FeedCard from '../components/FeedCard';

const BREAKDOWN = {
  reddit:     { label: 'Top subreddits', field: (it) => it.meta?.subreddit && `r/${it.meta.subreddit}` },
  github:     { label: 'Top langages',   field: (it) => it.meta?.language },
  hackernews: { label: 'Top auteurs',    field: (it) => it.meta?.author },
};

function SourceActivity({ color, sourceKey }) {
  const [hours, setHours] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetchHourly({ source: sourceKey, days: 7 }).then((h) => !cancelled && setHours(h)).catch(() => {});
    return () => { cancelled = true; };
  }, [sourceKey]);

  const data = useMemo(() => {
    const map = {};
    for (const h of hours) map[h.hour] = h.count;
    return Array.from({ length: 24 }, (_, i) => ({ h: `${i}h`, v: map[i] ?? 0 }));
  }, [hours]);
  const gid = 'srcFill-' + color.replace('#', '');
  return (
    <div className="h-[220px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="h" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#1f2937' }} interval={2} />
          <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
          <Tooltip contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gid})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Metric({ label, value, icon, color, delay }) {
  return (
    <div className="panel panel-hover p-5 relative" style={{ animation: `floatUp .55s ease ${delay}s both` }}>
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mono">{label}</span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${color}1a`, color }}>
          <Icon name={icon} size={14} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums text-gray-100">{value}</div>
    </div>
  );
}

export default function SourcePage({ sourceKey, onOpenKeyword }) {
  const meta = SOURCE_META[sourceKey];
  const color = meta.color;
  const [stats, setStats] = useState({ total: 0, avgScore: 0, breakdown: [], recent: [] });
  const [topKw, setTopKw] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchSourceStats(sourceKey), fetchTopKeywords({ source: sourceKey, limit: 6 })])
      .then(([s, kws]) => { if (!cancelled) { setStats(s); setTopKw(kws); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sourceKey]);

  const { total, avgScore, breakdown, recent } = stats;

  const maxBd = Math.max(1, ...breakdown.map((b) => b.count));
  const maxKw = Math.max(1, ...topKw.map((k) => k.count));

  return (
    <div className="px-6 py-6">
      <section className="panel p-6 mb-6" style={{ borderColor: `${color}55`, background: `linear-gradient(135deg, ${color}0a, transparent 50%), #111827` }}>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}1a`, color, border: `1px solid ${color}44` }}>
            <Icon name={meta.icon} size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] mono uppercase tracking-widest text-gray-500 mb-1">Source</div>
            <div className="text-2xl font-semibold" style={{ color }}>{meta.label}</div>
            <p className="text-sm text-gray-400 mt-1">{total} items agrégés · collecte automatique</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400">
              <span className="dot-pulse-ring text-emerald-400" />
            </span>
            Connecté
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Items collectés" value={total.toLocaleString('fr-FR')} icon="Database" color={color} delay={0} />
        <Metric label="Score moyen" value={avgScore.toLocaleString('fr-FR')} icon="ChevronUp" color={color} delay={0.05} />
        <Metric label="Technos détectées" value={topKw.length} icon="Hash" color={color} delay={0.1} />
        <Metric label={BREAKDOWN[sourceKey].label.replace('Top ', '')} value={breakdown.length} icon="List" color={color} delay={0.15} />
      </section>

      <section className="panel p-5 mb-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="LineChart" size={16} /> Activité sur 24h
          </h3>
          <p className="text-xs text-gray-400">Items collectés par heure depuis {meta.label} · 7 derniers jours</p>
        </div>
        <SourceActivity color={color} sourceKey={sourceKey} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="panel p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="BarChart2" size={16} /> {BREAKDOWN[sourceKey].label}
            </h3>
            <p className="text-xs text-gray-400">Répartition des items collectés</p>
          </div>
          <div className="space-y-2.5">
            {breakdown.length === 0 ? <p className="text-gray-600 text-sm">Pas de données.</p> : breakdown.map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <div className="text-sm text-gray-200 mono w-40 truncate">{b.name}</div>
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.count / maxBd * 100}%`, background: color, opacity: 0.8 }} />
                </div>
                <div className="text-xs mono text-gray-400 tabular-nums w-10 text-right">{b.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="Hash" size={16} /> Top keywords sur {meta.label}
            </h3>
            <p className="text-xs text-gray-400">Mentions extraites des items · cliquer pour le détail</p>
          </div>
          <div className="space-y-2.5">
            {topKw.map((k, i) => (
              <button key={k.keyword} onClick={() => onOpenKeyword(k.keyword)} className="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.02] text-left">
                <div className="text-xs mono text-gray-600 w-5 tabular-nums">{i + 1}</div>
                <div className="text-sm text-gray-100 font-medium w-32 truncate">{k.keyword}</div>
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${k.count / maxKw * 100}%`, background: color, opacity: 0.85 }} />
                </div>
                <div className="text-xs mono text-gray-400 tabular-nums w-10 text-right">{k.count}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5 mb-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name={meta.icon} size={16} /> Tous les items {meta.label}
          </h3>
          <p className="text-xs text-gray-400">Items récents triés par score</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {recent.slice(0, 12).map((it) => (
            <FeedCard key={it.id} item={{ ...it, meta: BREAKDOWN[sourceKey].field(it) || meta.label }}
              accent={color} onOpenKeyword={onOpenKeyword} />
          ))}
        </div>
      </section>
    </div>
  );
}
