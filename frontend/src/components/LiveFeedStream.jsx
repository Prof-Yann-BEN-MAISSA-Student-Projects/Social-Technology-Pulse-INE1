import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../lib/ui';
import { SOURCE_META } from '../lib/domains';

function timeAgo(ts) {
  const d = ts ? new Date(ts).getTime() : NaN;
  if (Number.isNaN(d)) return '';
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function LiveFeedStream({ pool, onOpenKeyword }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  
  const items = useMemo(
    () =>
      [...pool]
        .filter((i) => i?.fetchedAt)
        .sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt))
        .slice(0, 7),
    [pool]
  );

  return (
    <div className="panel p-5 fade-up-d4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="Radio" size={16} className="text-emerald-300" />
            Flux temps réel
          </h3>
          <p className="text-xs text-gray-400">Items récents collectés — agrégé sur les 3 sources</p>
        </div>
        <span className="text-[10px] mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" /> LIVE
        </span>
      </div>
      <div className="space-y-2 overflow-hidden flex-1">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">Pas encore de données.</div>
        ) : items.map((it) => (
          <div key={it.id} className="p-2.5 rounded-lg border border-gray-800 bg-[#0d1320] flex gap-3 items-start">
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: SOURCE_META[it.source]?.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-100 leading-snug line-clamp-2">{it.title}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] mono text-gray-500">
                <span className="uppercase">{it.source}</span>
                <span>·</span>
                <span>{timeAgo(it.fetchedAt)}</span>
                {(it.keywords?.length ?? 0) > 0 && <span>·</span>}
                <div className="flex gap-1">
                  {(it.keywords ?? []).slice(0, 2).map((k) => (
                    <button key={k} onClick={() => onOpenKeyword(k)} className="tag kw-link">{k}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
