import { Item } from '../models/item.model.js';
import { isConnected } from './db.js';

const store = {
  reddit:     [],
  hackernews: [],
  github:     []
};

const MAX_ITEMS = 200;

export async function upsert(source, items) {
  // Cache in-memory (toujours synchrone et rapide)
  const existing = new Map(store[source].map((i) => [i.id, i]));
  for (const item of items) existing.set(item.id, item);
  store[source] = [...existing.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ITEMS);

  // Persistance MongoDB (best-effort — n'interrompt pas le flux si MongoDB est indisponible)
  if (!isConnected()) return;
  try {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { externalId: item.id },
        update: {
          $set: {
            externalId: item.id,
            title:      item.title,
            url:        item.url,
            score:      item.score,
            source:     item.source,
            fetchedAt:  new Date(item.fetchedAt),
            keywords:   item.keywords ?? [],
            meta:       item.meta,
          },
        },
        upsert: true,
      },
    }));
    await Item.bulkWrite(ops);
  } catch (err) {
    console.error('[store] MongoDB bulkWrite failed:', err.message);
  }
}

export function getAll() {
  return {
    reddit:     [...store.reddit],
    hackernews: [...store.hackernews],
    github:     [...store.github]
  };
}

export function getBySource(source, { keyword } = {}) {
  const items = [...(store[source] ?? [])];
  return keyword ? items.filter((i) => i.keywords?.includes(keyword)) : items;
}

export function getTopN(n = 50, { keyword } = {}) {
  const all = Object.values(store).flat().sort((a, b) => b.score - a.score);
  const filtered = keyword ? all.filter((i) => i.keywords?.includes(keyword)) : all;
  return filtered.slice(0, n);
}

export function getCounts() {
  return Object.fromEntries(
    Object.entries(store).map(([k, v]) => [k, v.length])
  );
}
