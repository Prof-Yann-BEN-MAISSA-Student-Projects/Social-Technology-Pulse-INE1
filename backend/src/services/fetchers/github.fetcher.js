import client from '../http.client.js';
import { githubLimiter } from '../ratelimit.js';
import { normalizeGitHub } from '../normalizer.js';

const BASE = 'https://api.github.com';
const TOPICS = (process.env.GITHUB_TOPICS ?? 'web,ai,devops,cli,database').split(',');

function buildHeaders() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchTopic(topic) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `${BASE}/search/repositories?q=topic:${topic}+pushed:>${since}&sort=stars&order=desc&per_page=10`;
  const { data } = await client.get(url, { headers: buildHeaders() });
  return data.items.map(normalizeGitHub);
}

export async function fetchGitHub() {
  const results = [];
  for (const topic of TOPICS) {
    const items = await githubLimiter.schedule(() => fetchTopic(topic));
    results.push(...items);
  }
  return results;
}
