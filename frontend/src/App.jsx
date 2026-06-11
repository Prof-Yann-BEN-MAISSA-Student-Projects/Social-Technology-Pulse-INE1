import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import PredictionsPage from './pages/PredictionsPage';
import KeywordPage from './pages/KeywordPage';
import SourcePage from './pages/SourcePage';
import { fetchStatus, fetchTopKeywords, fetchTrending, fetchTopTrends } from './lib/api';

const TITLES = {
  dashboard: { t: 'Dashboard', s: 'Tendances tech temps réel' },
  predictions: { t: 'Prédictions IA', s: 'technos qui montent · momentum' },
  keyword: { t: 'Détail keyword', s: '' },
  'source-reddit': { t: 'Source · Reddit', s: 'posts agrégés' },
  'source-hackernews': { t: 'Source · Hacker News', s: 'top stories agrégées' },
  'source-github': { t: 'Source · GitHub', s: 'trending repositories' },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [detailKw, setDetailKw] = useState('react');

  const [status, setStatus] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [trending, setTrending] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchTopKeywords({ limit: 40 }),
      fetchTrending({ limit: 12 }),
      fetchTopTrends({ n: 80 }),
    ]).then(([kw, tr, its]) => {
      setKeywords(kw);
      setTrending(tr);
      setItems(its);
      if (kw[0]) setDetailKw((d) => (d === 'react' ? kw[0].keyword : d));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const load = () => fetchStatus().then(setStatus).catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const onOpenKeyword = useCallback((kw) => {
    setDetailKw(kw);
    setPage('keyword');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { t, s } = TITLES[page] || TITLES.dashboard;
  const subtitle = page === 'keyword' ? `#${detailKw}` : s;

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 min-w-0">
        <Topbar title={t} subtitle={subtitle} onKeywordSearch={onOpenKeyword} />

        {page === 'dashboard' && (
          <DashboardPage status={status} items={items} onOpenKeyword={onOpenKeyword} />
        )}
        {page === 'predictions' && <PredictionsPage onOpenKeyword={onOpenKeyword} />}
        {page === 'keyword' && (
          <KeywordPage kw={detailKw} keywords={keywords} items={items} trending={trending} onOpenKeyword={onOpenKeyword} />
        )}
        {page === 'source-reddit' && <SourcePage sourceKey="reddit" onOpenKeyword={onOpenKeyword} />}
        {page === 'source-hackernews' && <SourcePage sourceKey="hackernews" onOpenKeyword={onOpenKeyword} />}
        {page === 'source-github' && <SourcePage sourceKey="github" onOpenKeyword={onOpenKeyword} />}
      </main>
    </div>
  );
}
