import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const http = axios.create({ baseURL: API, timeout: 15000 });

function countryParam(country) {
  return country && country !== 'all' ? { country } : {};
}

export async function fetchStatus() {
  const { data } = await http.get('/api/status');
  return data;
}

export async function fetchTopKeywords({ country = 'all', limit = 40, source = null } = {}) {
  const { data } = await http.get('/api/keywords/top', {
    params: { limit, ...countryParam(country), ...(source ? { source } : {}) },
  });
  return data.keywords ?? [];
}

export async function fetchBySource(source) {
  const { data } = await http.get(`/api/trends/${source}`);
  return data ?? [];
}

export async function fetchRising({ horizon = 6, limit = 8, model = 'baseline' } = {}) {
  const { data } = await http.get('/api/predictions/rising', { params: { horizon, limit, model }, timeout: 30000 });
  return data ?? { maturity: {}, rising: [], fading: [] };
}

export async function fetchSourceStats(source) {
  const { data } = await http.get(`/api/stats/source/${source}`);
  return data ?? { total: 0, avgScore: 0, breakdown: [], recent: [] };
}

export async function fetchHeatmap({ days = 7, country = 'all' } = {}) {
  const { data } = await http.get('/api/stats/heatmap', {
    params: { days, ...countryParam(country) },
  });
  return data.cells ?? [];
}

export async function fetchHourly({ source = null, days = 1 } = {}) {
  const { data } = await http.get('/api/stats/hourly', {
    params: { days, ...(source ? { source } : {}) },
  });
  return data.hours ?? [];
}

export async function fetchTrending({ country = 'all', limit = 12 } = {}) {
  const { data } = await http.get('/api/keywords/trending', {
    params: { limit, ...countryParam(country) },
  });
  return data.trending ?? [];
}

export async function fetchHistory(keyword, { days = 14, country = 'all' } = {}) {
  const { data } = await http.get(`/api/keywords/${encodeURIComponent(keyword)}/history`, {
    params: { days, ...countryParam(country) },
  });
  return data.history ?? [];
}

export async function fetchTopTrends({ n = 60, keyword = '' } = {}) {
  const { data } = await http.get('/api/trends/top', {
    params: { n, ...(keyword ? { keyword } : {}) },
  });
  return data;
}
