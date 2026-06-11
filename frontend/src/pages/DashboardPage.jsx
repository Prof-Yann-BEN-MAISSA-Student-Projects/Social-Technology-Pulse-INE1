import { useState, useEffect, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import AnswerCard from '../components/AnswerCard';
import RankingChart from '../components/RankingChart';
import DomainDonut from '../components/DomainDonut';
import BubbleChart from '../components/BubbleChart';
import SourceFlowChart from '../components/SourceFlowChart';
import RadarCompare from '../components/RadarCompare';
import HistoryChart from '../components/HistoryChart';
import ActivityHeatmap from '../components/ActivityHeatmap';
import TrendingTable from '../components/TrendingTable';
import LiveFeedStream from '../components/LiveFeedStream';
import { AnimCounter } from '../lib/ui';
import { SOURCE_META, inDomain } from '../lib/domains';
import { fetchTopKeywords, fetchTrending } from '../lib/api';

export default function DashboardPage({ status, items, onOpenKeyword }) {
  const [country, setCountry] = useState('all');
  const [domain, setDomain] = useState('all');
  const [metric, setMetric] = useState('count');

  const [keywords, setKeywords] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selected, setSelected] = useState([]);
  const [prevRankedKey, setPrevRankedKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchTopKeywords({ country, limit: 40 }),
      fetchTrending({ country, limit: 12 }),
    ]).then(([kw, tr]) => {
      if (cancelled) return;
      setKeywords(kw);
      setTrending(tr);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [country]);

  const ranked = useMemo(() =>
    keywords
      .filter((k) => inDomain(k.keyword, domain))
      .sort((a, b) => (metric === 'score' ? b.totalScore - a.totalScore : b.count - a.count)),
    [keywords, domain, metric]
  );

  const rankedKey = ranked.map((k) => k.keyword).join(',');
  if (rankedKey !== prevRankedKey) {
    setPrevRankedKey(rankedKey);
    setSelected(ranked.slice(0, 3).map((k) => k.keyword));
  }

  const toggleSelect = (name) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name)
        : prev.length >= 4 ? [...prev.slice(1), name] : [...prev, name]
    );

  const countryItems = useMemo(
    () => (country === 'all' ? items : items.filter((i) => i.country === country)),
    [items, country]
  );

  const counts = status?.counts ?? {};
  const topSource = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const topKw = ranked[0];

  return (
    <div className="px-6 py-6">
      <FilterBar country={country} setCountry={setCountry} domain={domain} setDomain={setDomain}
                 metric={metric} setMetric={setMetric} />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Items collectés" icon="Database" delay={0}
          value={<AnimCounter to={status?.total ?? 0} />} sub="agrégés · toutes sources" />
        <StatCard label="Source la plus active" icon="Flame" delay={0.06} accentColor={SOURCE_META[topSource?.[0]]?.color}
          value={topSource ? SOURCE_META[topSource[0]]?.short : '—'} sub={topSource ? `${topSource[1]} items` : ''} />
        <StatCard label="Top techno" icon="Hash" delay={0.12}
          value={topKw?.keyword ?? '—'} sub={topKw ? `${(metric === 'score' ? topKw.totalScore : topKw.count).toLocaleString('fr-FR')} ${metric === 'score' ? 'score' : 'mentions'}` : ''} />
        <StatCard label="Technos suivies" icon="Activity" delay={0.18} accentColor="#34d399"
          value={ranked.length} sub="mots-clés détectés" />
      </section>

      {/* Synthèse + répartition par domaine */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2"><AnswerCard ranked={ranked} country={country} domain={domain} metric={metric} onOpenKeyword={onOpenKeyword} /></div>
        <DomainDonut keywords={ranked} metric={metric} />
      </section>

      {/* Classement + radar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">
        <div className="lg:col-span-2"><RankingChart ranked={ranked} metric={metric} onSelect={toggleSelect} selected={selected} /></div>
        <RadarCompare keywords={ranked} selected={selected} />
      </section>

      {/* Heatmap + évolution comparée */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">
        <div className="lg:col-span-2"><ActivityHeatmap country={country} /></div>
        <HistoryChart keywords={selected} days={14} country={country} />
      </section>

      {/* Vues analytiques */}
      <section className="mb-6">
        <BubbleChart keywords={ranked} onPick={onOpenKeyword} />
      </section>

      <section className="mb-6">
        <SourceFlowChart keywords={ranked} onPick={onOpenKeyword} />
      </section>

      {/* Trending + flux temps réel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">
        <TrendingTable trending={trending} onOpenKeyword={onOpenKeyword} />
        <LiveFeedStream pool={countryItems} onOpenKeyword={onOpenKeyword} />
      </section>

      <footer className="text-center text-[11px] text-gray-600 pb-6 mono">
        Social Pulse INPT · Données agrégées Reddit · Hacker News · GitHub
      </footer>
    </div>
  );
}
