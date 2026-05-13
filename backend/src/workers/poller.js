import cron from 'node-cron';
import { fetchReddit } from '../services/fetchers/reddit.fetcher.js';
import { fetchHackerNews } from '../services/fetchers/hackernews.fetcher.js';
import { fetchGitHub } from '../services/fetchers/github.fetcher.js';
import { upsert } from '../services/store.js';
import { POLL_INTERVALS } from '../config/sources.config.js';

function makeJob(name, fetcher, storeKey) {
  return async () => {
    try {
      console.log(`[poller] ${name} — fetch start`);
      const items = await fetcher();
      upsert(storeKey, items);
      console.log(`[poller] ${name} — ${items.length} items upserted`);
    } catch (err) {
      console.error(`[poller] ${name} — error:`, err.message);
    }
  };
}

export function startPollers() {
  const jobs = [
    { name: 'Reddit',      fetcher: fetchReddit,      key: 'reddit',     interval: POLL_INTERVALS.reddit },
    { name: 'HackerNews',  fetcher: fetchHackerNews,  key: 'hackernews', interval: POLL_INTERVALS.hackernews },
    { name: 'GitHub',      fetcher: fetchGitHub,       key: 'github',     interval: POLL_INTERVALS.github }
  ];

  for (const { name, fetcher, key, interval } of jobs) {
    const run = makeJob(name, fetcher, key);
    run(); // premier appel immédiat au démarrage
    cron.schedule(interval, run);
  }

  console.log('[poller] All pollers started');
}
