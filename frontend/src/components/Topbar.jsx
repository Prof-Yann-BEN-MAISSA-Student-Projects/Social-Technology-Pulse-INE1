import { useState } from 'react';
import { Icon } from '../lib/ui';

export default function Topbar({ title, subtitle, onKeywordSearch }) {
  const [query, setQuery] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase().replace(/^#/, '');
    if (q) onKeywordSearch(q);
  };

  return (
    <header className="sticky top-0 z-20 h-14 px-6 border-b border-gray-800 bg-[#0c1220]/90 backdrop-blur flex items-center gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-100 truncate">
          {title} <span className="text-gray-500 font-normal ml-2">{subtitle}</span>
        </div>
      </div>
      <form onSubmit={submit} className="ml-auto relative">
        <Icon name="Search" size={14} className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un keyword…"
          className="w-56 bg-[#111827] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60" />
      </form>
    </header>
  );
}
