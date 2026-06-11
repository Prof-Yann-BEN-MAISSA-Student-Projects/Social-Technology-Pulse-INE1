export function fillDailySeries(history, days = 14) {
  const byDate = new Map(history.map((d) => [d.date, d.count]));
  const out = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return out;
}
