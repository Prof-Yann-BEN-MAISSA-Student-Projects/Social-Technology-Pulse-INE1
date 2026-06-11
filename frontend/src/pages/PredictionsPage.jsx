import { useState, useEffect } from 'react';
import { Icon } from '../lib/ui';
import { fetchRising } from '../lib/api';

const HORIZONS = [6, 12, 24];

function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 60 ? '#34d399' : pct >= 30 ? '#fbbf24' : '#6b7280';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] mono text-gray-500 tabular-nums">{pct}%</span>
    </div>
  );
}

function PredCard({ p, up, onOpenKeyword }) {
  const color = up ? '#34d399' : '#f87171';
  return (
    <button onClick={() => onOpenKeyword?.(p.keyword)}
      className="w-full text-left p-3 rounded-lg border border-gray-800 bg-[#0d1320] hover:bg-white/[0.02] flex items-center gap-3">
      <span style={{ color }}><Icon name={up ? 'TrendingUp' : 'TrendingDown'} size={16} /></span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-100 truncate">{p.keyword}</div>
        <div className="mt-1"><ConfidenceBar value={p.confidence} /></div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold tabular-nums" style={{ color }}>
          {p.velocityPct > 0 ? '+' : ''}{p.velocityPct}%/h
        </div>
        <div className="text-[10px] mono text-gray-500 tabular-nums">→ {p.projection}</div>
      </div>
    </button>
  );
}

const MODELS = [
  { id: 'baseline', label: 'Baseline' },
  { id: 'lstm', label: 'LSTM' },
];

export default function PredictionsPage({ onOpenKeyword }) {
  const [horizon, setHorizon] = useState(6);
  const [model, setModel] = useState('baseline');
  const [data, setData] = useState(null);

  const reqKey = `${horizon}:${model}`;
  const [prevKey, setPrevKey] = useState(reqKey);
  if (reqKey !== prevKey) { setPrevKey(reqKey); setData(null); }

  useEffect(() => {
    let cancelled = false;
    fetchRising({ horizon, limit: 8, model })
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData({ maturity: {}, rising: [], fading: [] }); });
    return () => { cancelled = true; };
  }, [horizon, model]);

  const loading = data === null;
  const rising = data?.rising ?? [];
  const fading = data?.fading ?? [];
  const maturity = data?.maturity ?? {};

  const dormant = !loading && model === 'lstm' && rising.length === 0 && fading.length === 0;

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="Sparkles" size={18} className="text-indigo-300" />
            Prédictions — technos qui montent
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Momentum calculé sur la trajectoire de score des dernières 24h · extrapolation à l'horizon choisi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {MODELS.map((mo) => (
              <button key={mo.id} onClick={() => setModel(mo.id)}
                className={`px-3 py-1.5 rounded-lg text-xs mono border ${model === mo.id
                  ? 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-200'
                  : 'border-gray-800 text-gray-400 hover:bg-white/[0.02]'}`}>
                {mo.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {HORIZONS.map((h) => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg text-xs mono border ${horizon === h
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                  : 'border-gray-800 text-gray-400 hover:bg-white/[0.02]'}`}>
                +{h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jauge de maturité */}
      <div className="panel p-3 mb-5 flex items-center gap-3 text-xs">
        <Icon name="Activity" size={14} className="text-emerald-300 shrink-0" />
        <span className="text-gray-300">{maturity.note ?? 'Chargement…'}</span>
        {maturity.model && (
          <span className="ml-auto text-[10px] mono px-2 py-1 rounded-md bg-gray-800 text-gray-400">
            modèle : {maturity.model}
          </span>
        )}
      </div>

      {loading && <p className="text-gray-500 text-sm py-16 text-center">Calcul des tendances…</p>}

      {dormant && (
        <div className="panel p-10 text-center">
          <Icon name="Hourglass" size={28} className="text-gray-600 mb-3" />
          <div className="text-gray-300 font-medium mb-1">Modèle LSTM en veille</div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {maturity.note ?? "Il s'activera dès qu'il y aura assez d'historique. La baseline reste disponible."}
          </p>
        </div>
      )}

      {!loading && !dormant && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2 mb-3">
              <Icon name="TrendingUp" size={16} className="text-emerald-300" />
              En hausse <span className="text-xs text-gray-500 font-normal">({rising.length})</span>
            </h3>
            <div className="space-y-2">
              {rising.length === 0
                ? <p className="text-gray-600 text-sm py-6 text-center">Aucune hausse détectée.</p>
                : rising.map((p) => <PredCard key={p.keyword} p={p} up onOpenKeyword={onOpenKeyword} />)}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2 mb-3">
              <Icon name="TrendingDown" size={16} className="text-red-400" />
              En perte de vitesse <span className="text-xs text-gray-500 font-normal">({fading.length})</span>
            </h3>
            <div className="space-y-2">
              {fading.length === 0
                ? <p className="text-gray-600 text-sm py-6 text-center">Aucun déclin détecté.</p>
                : fading.map((p) => <PredCard key={p.keyword} p={p} up={false} onOpenKeyword={onOpenKeyword} />)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
