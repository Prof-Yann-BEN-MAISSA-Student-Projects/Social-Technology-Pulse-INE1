import axios from 'axios';
import { USER_AGENT } from '../config/sources.config.js';

const client = axios.create({ timeout: 10_000 });

client.interceptors.request.use((config) => {
  config.headers['User-Agent'] = USER_AGENT;
  return config;
});

client.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  if (response?.status === 429 && !config._retried) {
    config._retried = true;
    const wait = parseInt(response.headers['retry-after'] ?? '60', 10) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return client(config);
  }
  return Promise.reject(error);
});

export default client;
