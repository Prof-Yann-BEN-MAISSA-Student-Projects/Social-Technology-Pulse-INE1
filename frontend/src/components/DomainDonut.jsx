import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Icon } from '../lib/ui';
import { domainOf, DOMAIN_LABELS, DOMAIN_COLORS } from '../lib/domains';

export default function DomainDonut({ keywords, metric }) {
  const totals = {};
  for (const k of keywords) {
    const d = domainOf(k.keyword);
    totals[d] = (totals[d] ?? 0) + (metric === 'score' ? k.totalScore : k.count);
  }
  const data = Object.entries(totals)
    .map(([domain, value]) => ({ name: DOMAIN_LABELS[domain] ?? domain, domain, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="panel p-5 fade-up-d2">
      <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2 mb-1">
        <Icon name="CircleDot" size={16} className="text-indigo-300" />
        Répartition par domaine
      </h3>
      <p className="text-xs text-gray-400 mb-3">Part de chaque domaine ({metric === 'score' ? 'score cumulé' : 'mentions'}).</p>

      {data.length === 0 ? (
        <p className="text-gray-600 text-sm py-10 text-center">Aucune donnée.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
              {data.map((d) => <Cell key={d.domain} fill={DOMAIN_COLORS[d.domain] ?? '#6b7280'} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0d1320', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
