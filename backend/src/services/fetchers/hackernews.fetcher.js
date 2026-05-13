import client from '../http.client.js';
import { hackerNewsLimiter } from '../ratelimit.js';
import { normalizeHackerNews } from '../normalizer.js';

const BASE = 'https://hacker-news.firebaseio.com/v0';
const TOP_N = 30;

async function fetchItem(id) {
  const { data } = await client.get(`${BASE}/item/${id}.json`);
  return data;
}

export async function fetchHackerNews() {
  const { data: ids } = await client.get(`${BASE}/topstories.json`);
  const topIds = ids.slice(0, TOP_N);

  const items = await Promise.all(
    topIds.map((id) => hackerNewsLimiter.schedule(() => fetchItem(id)))
  );

  return items
    .filter((item) => item && item.type === 'story' && item.url)
    .map(normalizeHackerNews);
}
