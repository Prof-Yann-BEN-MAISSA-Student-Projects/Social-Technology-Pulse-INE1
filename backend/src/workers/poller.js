import cron from 'node-cron';
import { fetchReddit } from '../services/fetchers/reddit.fetcher.js';
import { fetchHackerNews } from '../services/fetchers/hackernews.fetcher.js';
import { fetchGitHub } from '../services/fetchers/github.fetcher.js';
import { upsert } from '../services/store.js';
import { POLL_INTERVALS } from '../config/sources.config.js';

const status = {
  reddit:     { lastSuccess: null, lastError: null, count: 0, running: false },
  hackernews: { lastSuccess: null, lastError: null, count: 0, running: false },
  github:     { lastSuccess: null, lastError: null, count: 0, running: false },
};

export function getPollerStatus() {
  return structuredClone(status);
}

function makeJob(name, fetcher, key) {
  return async () => {
    status[key].running = true;
    try {
      console.log(`[poller] ${name} — fetch start`);
      const items = await fetcher();
      await upsert(key, items);
      status[key].lastSuccess = new Date().toISOString();
      status[key].count = items.length;
      status[key].lastError = null;
      console.log(`[poller] ${name} — ${items.length} items upserted`);
    } catch (err) {
      status[key].lastError = err.message;
      console.error(`[poller] ${name} — error:`, err.message);
    } finally {
      status[key].running = false;
    }
  };
}

export function startPollers() {
  const jobs = [
    { name: 'Reddit',     fetcher: fetchReddit,     key: 'reddit',     interval: POLL_INTERVALS.reddit },
    { name: 'HackerNews', fetcher: fetchHackerNews, key: 'hackernews', interval: POLL_INTERVALS.hackernews },
    { name: 'GitHub',     fetcher: fetchGitHub,     key: 'github',     interval: POLL_INTERVALS.github },
  ];

  for (const { name, fetcher, key, interval } of jobs) {
    const run = makeJob(name, fetcher, key);
    run();
    cron.schedule(interval, run);
  }

  console.log('[poller] All pollers started');
}
