import { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip, Layer, Rectangle } from 'recharts';
import { Icon } from '../lib/ui';
import { SOURCE_META, DOMAIN_LABELS, DOMAIN_COLORS, domainOf } from '../lib/domains';

const SOURCES = ['reddit', 'hackernews', 'github'];

function buildGraph(keywords) {
  const top = keywords.filter((k) => k.count > 0).slice(0, 12);
  if (!top.length) return { nodes: [], links: [] };

  const sd = new Map();
  const dk = new Map();
  const domainKey = {};

  for (const k of top) {
    const dKey = domainOf(k.keyword);
    const dLabel = DOMAIN_LABELS[dKey] ?? 'Autres';
    domainKey[dLabel] = DOMAIN_LABELS[dKey] ? dKey : 'other';
    for (const s of SOURCES) {
      const v = k.bySource?.[s] ?? 0;
      if (v > 0) {
        const sLabel = SOURCE_META[s].label;
        if (!sd.has(sLabel)) sd.set(sLabel, new Map());
        const inner = sd.get(sLabel);
        inner.set(dLabel, (inner.get(dLabel) ?? 0) + v);
      }
    }
    if (!dk.has(dLabel)) dk.set(dLabel, new Map());
    dk.get(dLabel).set(k.keyword, k.count);
  }

  const nodes = [];
  const idx = new Map();
  const add = (name, color, kind) => {
    if (!idx.has(name)) { idx.set(name, nodes.length); nodes.push({ name, color, kind }); }
    return idx.get(name);
  };

  const links = [];
  for (const [sLabel, inner] of sd) {
    const sKey = SOURCES.find((s) => SOURCE_META[s].label === sLabel);
    const si = add(sLabel, SOURCE_META[sKey].color, 'source');
    for (const [dLabel, value] of inner) {
      const di = add(dLabel, DOMAIN_COLORS[domainKey[dLabel]] ?? '#6b7280', 'domain');
      links.push({ source: si, target: di, value });
    }
  }
  for (const [dLabel, inner] of dk) {
    const color = DOMAIN_COLORS[domainKey[dLabel]] ?? '#818cf8';
    const di = add(dLabel, color, 'domain');
    for (const [kw, value] of inner) {
      const ki = add(kw, color, 'keyword');
      links.push({ source: di, target: ki, value });
    }
  }

  return { nodes, links };
}

function NodeShape(props, onPick) {
  const { x, y, width, height, payload, containerWidth } = props;
  const isRight = x + width > containerWidth - 24;
  const clickable = payload.kind === 'keyword';
  const color = payload.color || '#6366f1';
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.92} radius={2}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
        onClick={() => clickable && onPick?.(payload.name)} />
      <text x={isRight ? x - 7 : x + width + 7} y={y + height / 2}
            textAnchor={isRight ? 'end' : 'start'} dominantBaseline="middle"
            fontSize="11" fill="#cbd5e1" style={{ pointerEvents: 'none' }}>
        {payload.name}
      </text>
    </Layer>
  );
}

function LinkShape(props) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
  const color = payload?.source?.color || '#64748b';
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none" stroke={color} strokeWidth={Math.max(1, linkWidth)} strokeOpacity={0.28}
    />
  );
}

export default function SourceFlowChart({ keywords, onPick }) {
  const data = useMemo(() => buildGraph(keywords), [keywords]);

  return (
    <div className="panel p-5 fade-up-d3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Icon name="Workflow" size={16} className="text-indigo-300" />
            Flux des sources
          </h3>
          <p className="text-xs text-gray-400">
            Comment chaque source alimente les domaines puis les technos · épaisseur = volume · clique un mot-clé
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          {SOURCES.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: SOURCE_META[s].color }} />{SOURCE_META[s].short}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full" style={{ height: 420 }}>
        {data.nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">Pas encore de données.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={data}
              nodeWidth={12}
              nodePadding={16}
              linkCurvature={0.5}
              iterations={64}
              margin={{ top: 8, right: 90, bottom: 8, left: 70 }}
              node={(p) => NodeShape(p, onPick)}
              link={<LinkShape />}
            >
              <Tooltip
                contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#e5e7eb' }}
                labelStyle={{ color: '#e5e7eb' }}
                formatter={(value, _n, item) => [`${value} items`, item?.payload?.name ?? '']}
              />
            </Sankey>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
