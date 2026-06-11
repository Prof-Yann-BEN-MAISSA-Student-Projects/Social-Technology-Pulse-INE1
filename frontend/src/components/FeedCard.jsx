import { Icon, formatScore } from '../lib/ui';

export default function FeedCard({ item, accent = '#a5b4fc', onOpenKeyword }) {
  const title = item.title || item.text || '';
  const kws = item.keywords || item.kws || [];
  const meta = item.meta || item.meta?.permalink || '';

  return (
    <a
      href={item.url || undefined}
      target={item.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="panel-hover block p-3.5 rounded-xl border border-gray-800 bg-[#0d1320] hover:bg-[#101729]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-gray-100 leading-snug line-clamp-2">{title}</div>
        {item.score != null && (
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold tabular-nums" style={{ color: accent }}>
            <Icon name="ChevronUp" size={12} />
            {formatScore(item.score)}
          </div>
        )}
      </div>
      {meta && <div className="mt-2 text-[11px] text-gray-500">{typeof meta === 'string' ? meta : ''}</div>}
      {kws.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {kws.slice(0, 3).map((k) => (
            <button
              key={k}
              onClick={(e) => { e.preventDefault(); onOpenKeyword?.(k); }}
              className="tag kw-link">
              {k}
            </button>
          ))}
        </div>
      )}
    </a>
  );
}
