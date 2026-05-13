const store = {
  reddit:     [],
  hackernews: [],
  github:     []
};

const MAX_ITEMS = 200;

export function upsert(source, items) {
  const existing = new Map(store[source].map((i) => [i.id, i]));
  for (const item of items) existing.set(item.id, item);
  store[source] = [...existing.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ITEMS);
}

export function getAll() {
  return {
    reddit:     [...store.reddit],
    hackernews: [...store.hackernews],
    github:     [...store.github]
  };
}

export function getBySource(source) {
  return [...(store[source] ?? [])];
}

export function getTopN(n = 50) {
  return Object.values(store)
    .flat()
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
