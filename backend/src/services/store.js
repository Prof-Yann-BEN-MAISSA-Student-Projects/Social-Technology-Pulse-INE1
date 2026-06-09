import { Item } from '../models/item.model.js';
import { Snapshot } from '../models/snapshot.model.js';
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
            country:    item.country ?? 'GLOBAL',
            fetchedAt:  new Date(item.fetchedAt),
            keywords:   item.keywords ?? [],
            meta:       item.meta,
          },
        },
        upsert: true,
      },
    }));
    await Item.bulkWrite(ops);

    const snapshots = items.map((item) => ({
      externalId: item.id,
      source:     item.source,
      score:      item.score,
      fetchedAt:  new Date(item.fetchedAt),
    }));
    await Snapshot.insertMany(snapshots, { ordered: false });
  } catch (err) {
    console.error('[store] MongoDB write failed:', err.message);
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
  const srcMax = {};
  for (const [src, items] of Object.entries(store)) {
    srcMax[src] = Math.max(1, ...items.map((i) => i.score || 0));
  }
  const norm = (i) => Math.log1p(Math.max(0, i.score || 0)) / Math.log1p(srcMax[i.source] || 1);

  const all = Object.values(store).flat();
  const filtered = keyword ? all.filter((i) => i.keywords?.includes(keyword)) : all;
  return [...filtered].sort((a, b) => norm(b) - norm(a)).slice(0, n);
}

export function getCounts() {
  return Object.fromEntries(
    Object.entries(store).map(([k, v]) => [k, v.length])
  );
}
