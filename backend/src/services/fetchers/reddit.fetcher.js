import client from '../http.client.js';
import { redditLimiter } from '../ratelimit.js';
import { normalizeReddit } from '../normalizer.js';
import { REDDIT_SUBS, REDDIT_SORTS } from '../../config/sources.config.js';

async function fetchSubreddit(sub, sort) {
  const url = `https://www.reddit.com/r/${sub}/${sort}.json?limit=25`;
  const { data } = await client.get(url);
  return data.data.children.map((post) => {
    post.data._sort = sort;
    return normalizeReddit(post, sub);
  });
}

export async function fetchReddit() {
  const results = [];
  for (const sub of REDDIT_SUBS) {
    for (const sort of REDDIT_SORTS) {
      const items = await redditLimiter.schedule(() => fetchSubreddit(sub, sort));
      results.push(...items);
    }
  }
  return results;
}
