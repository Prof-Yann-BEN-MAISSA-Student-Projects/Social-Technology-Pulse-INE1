import { COUNTRIES, DOMAIN_LABELS } from '../lib/domains';

const DOMAINS = Object.keys(DOMAIN_LABELS);

function Pill({ active, onClick, children, activeClass = 'bg-indigo-500/15 border-indigo-500/50 text-indigo-100' }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
        active ? activeClass : 'border-gray-800 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-gray-600'
      }`}>
      {children}
    </button>
  );
}

export default function FilterBar({ country, setCountry, domain, setDomain, metric, setMetric }) {
  return (
    <div className="panel p-4 flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mono">Pays</span>
        <div className="flex gap-1">
          {COUNTRIES.map((c) => (
            <Pill key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}
                  activeClass="bg-emerald-500/15 border-emerald-500/50 text-emerald-100">
              {c.flag} {c.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mono">Domaine</span>
        <div className="flex gap-1 flex-wrap">
          {DOMAINS.map((d) => (
            <Pill key={d} active={domain === d} onClick={() => setDomain(d)}>{DOMAIN_LABELS[d]}</Pill>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mono">Mesure</span>
        <div className="flex bg-[#0d1320] border border-gray-800 rounded-lg p-0.5">
          {[['count', 'Mentions'], ['score', 'Score']].map(([m, label]) => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                metric === m ? 'bg-indigo-500/20 text-indigo-100' : 'text-gray-400 hover:text-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
