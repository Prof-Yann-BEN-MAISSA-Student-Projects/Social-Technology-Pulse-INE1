import { Icon } from '../lib/ui';

function NavItem({ id, icon, label, badge, badgeKind, page, setPage }) {
  const active = page === id;
  return (
    <button
      onClick={() => setPage(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition border ${
        active
          ? 'bg-indigo-500/10 text-indigo-200 border-indigo-500/30 indigo-glow-sm'
          : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.03] border-transparent'
      }`}>
      <Icon name={icon} size={16} className={active ? 'text-indigo-300' : ''} />
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md mono ${
          badgeKind === 'live'
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>{badge}</span>
      )}
    </button>
  );
}

export default function Sidebar({ page, setPage }) {
  const props = { page, setPage };
  return (
    <aside className="w-[230px] shrink-0 sticky top-0 h-screen border-r border-gray-800 bg-[#0c1220] flex flex-col">
      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Icon name="Activity" size={18} className="text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-fuchsia-400 dot-pulse" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-100 truncate">Social Pulse</div>
          <div className="text-[10px] text-gray-500 mono tracking-wider">INPT</div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-thin">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 font-medium px-3 mb-1.5 mono">Principal</div>
        <div className="space-y-1">
          <NavItem {...props} id="dashboard" icon="LayoutGrid" label="Dashboard" badge="LIVE" badgeKind="live" />
          <NavItem {...props} id="predictions" icon="Sparkles" label="Prédictions IA" />
          <NavItem {...props} id="keyword" icon="Hash" label="Détail keyword" />
        </div>

        <div className="text-[10px] uppercase tracking-widest text-gray-600 font-medium px-3 mb-1.5 mt-5 mono">Sources</div>
        <div className="space-y-1">
          <NavItem {...props} id="source-reddit" icon="MessageCircle" label="Reddit" />
          <NavItem {...props} id="source-hackernews" icon="Newspaper" label="Hacker News" />
          <NavItem {...props} id="source-github" icon="Github" label="GitHub" />
        </div>
      </nav>
    </aside>
  );
}
