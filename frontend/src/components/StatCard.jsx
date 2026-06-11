import { Icon } from '../lib/ui';

export default function StatCard({ label, value, sub, icon, accentColor = '#818cf8', delay = 0 }) {
  return (
    <div className="panel panel-hover relative p-5" style={{ animation: `floatUp .55s ease ${delay}s both` }}>
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mono">{label}</span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: `${accentColor}1a`, color: accentColor }}>
          <Icon name={icon} size={14} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums text-gray-100">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
