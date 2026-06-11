import { DOMAIN_LABELS, COUNTRIES } from '../lib/domains';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function AnswerCard({ ranked, country, domain, metric, onOpenKeyword }) {
  const top3 = ranked.slice(0, 3);
  const c = COUNTRIES.find((x) => x.code === country);
  const metricLabel = metric === 'score' ? 'score cumulé' : 'mentions';

  const context = [
    domain !== 'all' ? `en ${DOMAIN_LABELS[domain]}` : null,
    country !== 'all' ? `· ${c?.flag} ${c?.label}` : null,
  ].filter(Boolean).join(' ');

  if (!top3.length) {
    return (
      <div className="panel p-6 h-full flex items-center">
        <p className="text-gray-400 text-sm">Aucune donnée pour ce filtre. Élargis la sélection (pays / domaine).</p>
      </div>
    );
  }

  const winner = top3[0];
  const value = metric === 'score' ? winner.totalScore : winner.count;

  return (
    <div className="panel p-6 h-full relative overflow-hidden"
         style={{ borderColor: '#3b3170', background: 'linear-gradient(135deg, rgba(99,102,241,.10), transparent 55%), #111827' }}>
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(99,102,241,.14), transparent 70%)' }} />
      <p className="text-indigo-300 text-[10px] uppercase tracking-widest mono mb-2">
        Le plus populaire {context && `· ${context}`}
      </p>
      <div className="flex items-end gap-3">
        <span className="text-5xl">🥇</span>
        <div>
          <button onClick={() => onOpenKeyword?.(winner.keyword)}
                  className="text-3xl font-semibold indigo-gradient-text kw-link">{winner.keyword}</button>
          <p className="text-gray-400 text-sm">
            {value.toLocaleString('fr-FR')} {metricLabel} · {winner.sources?.length ?? 1} source(s)
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {top3.map((k, i) => {
          const v = metric === 'score' ? k.totalScore : k.count;
          const pct = Math.round((v / value) * 100);
          return (
            <div key={k.keyword} className="flex items-center gap-2">
              <span className="w-6 text-center">{MEDALS[i]}</span>
              <button onClick={() => onOpenKeyword?.(k.keyword)}
                      className="w-24 text-sm text-gray-200 truncate text-left kw-link">{k.keyword}</button>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
              </div>
              <span className="text-xs text-gray-400 w-14 text-right tabular-nums">{v.toLocaleString('fr-FR')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
