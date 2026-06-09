import client from '../http.client.js';
import { redditLimiter } from '../ratelimit.js';
import { normalizeReddit } from '../normalizer.js';
import {
  REDDIT_SUBS, REDDIT_SORTS, REDDIT_COUNTRY_SUBS, countryForSub,
} from '../../config/sources.config.js';

const ALL_SUBS = [...new Set([...REDDIT_SUBS, ...Object.keys(REDDIT_COUNTRY_SUBS)])];

// Reddit bloque l'acces anonyme au .json (403). On rejoue le cookie `loid` (logged-out id, Validité 2 ans) via REDDIT_COOKIE (.env)
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0';

let warnedNoCookie = false;

async function fetchSubreddit(sub, sort) {
  const cookie = process.env.REDDIT_COOKIE;
  if (!cookie && !warnedNoCookie) {
    console.warn('[reddit] REDDIT_COOKIE absent du .env — Reddit renverra 403.');
    warnedNoCookie = true;
  }
  const url = `https://www.reddit.com/r/${sub}/${sort}.json?limit=25`;
  const { data } = await client.get(url, {
    headers: { 'User-Agent': BROWSER_UA, Cookie: cookie },
  });
  const country = countryForSub(sub);
  return data.data.children.map((post) => {
    post.data._sort = sort;
    return normalizeReddit(post, sub, country);
  });
}

export async function fetchReddit() {
  const results = [];
  for (const sub of ALL_SUBS) {
    for (const sort of REDDIT_SORTS) {
      const items = await redditLimiter.schedule(() => fetchSubreddit(sub, sort));
      results.push(...items);
    }
  }
  return results;
}
