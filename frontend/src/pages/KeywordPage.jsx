import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Icon } from '../lib/ui';
import { SOURCE_META, domainOf } from '../lib/domains';
import { fetchHistory } from '../lib/api';
import { fillDailySeries } from '../lib/series';
import FeedCard from '../components/FeedCard';

export default function KeywordPage({ kw, keywords, items, trending, onOpenKeyword }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchHistory(kw, { days: 14 }).then((h) => !cancelled && setHistory(h)).catch(() => {});
    return () => { cancelled = true; };
  }, [kw]);

  const agg = useMemo(() => keywords.find((k) => k.keyword === kw), [keywords, kw]);
  const trend = useMemo(() => trending.find((t) => t.keyword === kw), [trending, kw]);

  // Posts mentionnant le keyword
  const posts = useMemo(
    () => items.filter((i) => i.keywords?.includes(kw)).slice(0, 4),
    [items, kw]
  );

  // Co-occurrences
  const related = useMemo(() => {
    const co = {};
    for (const it of items) {
      if (!it.keywords?.includes(kw)) continue;
      for (const k of it.keywords) if (k !== kw) co[k] = (co[k] ?? 0) + 1;
    }
    const max = Math.max(1, ...Object.values(co));
    return Object.entries(co)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([k, c]) => ({ kw: k, strength: Math.round((c / max) * 100) }));
  }, [items, kw]);

  const mentions = agg?.count ?? 0;
  // % si volume suffisant, sinon nombre absolu, sinon —
  const growth = trend?.growth != null
    ? `${trend.growth > 0 ? '+' : ''}${trend.growth}%`
    : trend ? `+${trend.delta}` : '—';
  const score = agg?.totalScore ?? 0;

  const volData = history.length
    ? fillDailySeries(history, 14).map((h) => ({ d: h.date.slice(5), v: h.count }))
    : [];

  return (
    <div className="px-6 py-6">
      {/* Hero */}
      <section className="panel p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="min-w-0">
            <div className="text-[10px] mono uppercase tracking-widest text-gray-500 mb-2">Keyword sélectionné</div>
            <div className="text-5xl font-semibold mono indigo-gradient-text">#{kw}</div>
            <p className="mt-3 text-sm text-gray-300 max-w-2xl">
              Domaine : <span className="text-gray-200 capitalize">{domainOf(kw)}</span> · agrégé sur Reddit, Hacker News et GitHub.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {Object.entries(SOURCE_META).map(([k, m]) => (
                <span key={k} className="tag" style={{ borderColor: `${m.color}55`, color: m.color, background: `${m.color}14` }}>{m.short}</span>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 md:max-w-md md:ml-auto">
            <div>
              <div className="text-2xl font-semibold tabular-nums mono text-indigo-300">{mentions.toLocaleString('fr-FR')}</div>
              <div className="text-[10px] mono uppercase tracking-widest text-gray-500 mt-1">Mentions</div>
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums mono text-emerald-400">{growth}</div>
              <div className="text-[10px] mono uppercase tracking-widest text-gray-500 mt-1">Croissance (vs hier)</div>
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums mono text-amber-300">{score.toLocaleString('fr-FR')}</div>
              <div className="text-[10px] mono uppercase tracking-widest text-gray-500 mt-1">Score cumulé</div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume + nuage de co-occurrences */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="LineChart" size={16} className="text-indigo-300" /> Volume dans le temps
            </h3>
            <p className="text-xs text-gray-400">Mentions par jour (toutes sources) · 14 jours</p>
          </div>
          <div className="h-[240px] -ml-2">
            {volData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">Historique en cours d’accumulation…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="d" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#1f2937' }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#a78bfa" strokeWidth={2} fill="url(#volFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="Network" size={16} className="text-indigo-300" /> Nuage de co-occurrences
            </h3>
            <p className="text-xs text-gray-400">Technos souvent citées avec #{kw}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 leading-none items-center">
            {related.length === 0 ? (
              <span className="text-gray-600 text-xs">Aucune co-occurrence détectée.</span>
            ) : related.map((r, i) => (
              <button key={r.kw} onClick={() => onOpenKeyword(r.kw)} className="mono kw-link"
                style={{ fontSize: `${12 + r.strength * 0.16}px`,
                  color: ['#a5b4fc', '#34d399', '#f0abfc', '#fcd34d', '#22d3ee', '#94a3b8'][i % 6] }}>
                {r.kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts + related bars */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="MessageSquare" size={16} className="text-indigo-300" /> Posts mentionnant #{kw}
            </h3>
            <p className="text-xs text-gray-400">Items agrégés, toutes sources</p>
          </div>
          <div className="space-y-2.5">
            {posts.length === 0 ? (
              <p className="text-gray-600 text-sm py-6 text-center">Aucun post récent ne mentionne ce keyword.</p>
            ) : posts.map((p) => (
              <FeedCard key={p.id} item={{ ...p, meta: p.meta?.subreddit ? `r/${p.meta.subreddit}` : p.source }}
                accent={SOURCE_META[p.source]?.color} onOpenKeyword={onOpenKeyword} />
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
              <Icon name="Network" size={16} className="text-indigo-300" /> Keywords associés
            </h3>
            <p className="text-xs text-gray-400">Force de co-occurrence</p>
          </div>
          <div className="space-y-2.5">
            {related.map((r) => (
              <button key={r.kw} onClick={() => onOpenKeyword(r.kw)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-gray-800">
                <div className="text-sm font-medium text-gray-100 w-28 truncate text-left">{r.kw}</div>
                <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${r.strength}%` }} />
                </div>
                <div className="text-xs mono text-gray-400 tabular-nums w-10 text-right">{r.strength}%</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
