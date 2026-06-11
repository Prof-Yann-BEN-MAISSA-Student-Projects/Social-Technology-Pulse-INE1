
export const DOMAIN_KEYWORDS = {
  web: [
    'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix', 'astro',
    'htmx', 'tailwind', 'solidjs', 'express', 'fastapi', 'django', 'flask',
    'spring', 'rails', 'laravel', 'nestjs', 'fiber', 'gin', 'actix', 'axum',
    'nodejs', 'deno', 'bun', 'vite', 'webpack', 'esbuild', 'graphql', 'grpc',
    'websocket', 'javascript', 'typescript', 'php',
  ],
  mobile: [
    'flutter', 'react native', 'swiftui', 'jetpack compose', 'ionic', 'expo',
    'xamarin', 'android', 'ios', 'capacitor', 'swift', 'kotlin', 'dart',
  ],
  ai: [
    'llm', 'gpt', 'chatgpt', 'openai', 'claude', 'gemini', 'mistral', 'ollama',
    'pytorch', 'tensorflow', 'keras', 'langchain', 'llamaindex', 'rag',
    'machine learning', 'deep learning', 'nlp', 'computer vision', 'transformer',
    'diffusion', 'fine-tuning', 'embedding', 'copilot',
  ],
  database: [
    'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'elasticsearch',
    'cassandra', 'supabase', 'drizzle', 'prisma',
  ],
  devops: [
    'docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'azure', 'gcp',
    'linux', 'nginx', 'devops', 'serverless', 'ci/cd',
  ],
  languages: [
    'python', 'rust', 'golang', 'java', 'ruby', 'scala', 'elixir', 'haskell',
    'lua', 'zig',
  ],
  iot: ['arduino', 'esp32', 'raspberry pi', 'micropython', 'platformio'],
};

export const DOMAIN_LABELS = {
  all: 'Tous', web: 'Web', mobile: 'Mobile', ai: 'IA / ML',
  database: 'Bases de données', devops: 'DevOps', languages: 'Langages', iot: 'IoT / Arduino',
};

const KEYWORD_DOMAIN = {};
for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
  for (const kw of kws) KEYWORD_DOMAIN[kw] = domain;
}

export function domainOf(keyword) {
  return KEYWORD_DOMAIN[keyword] ?? 'other';
}

export function inDomain(keyword, domain) {
  if (domain === 'all') return true;
  return DOMAIN_KEYWORDS[domain]?.includes(keyword) ?? false;
}

export const COUNTRIES = [
  { code: 'all', label: 'Tous pays', flag: '🌐' },
  { code: 'GLOBAL', label: 'Global', flag: '🌍' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'MA', label: 'Maroc', flag: '🇲🇦' },
];

export const SOURCE_META = {
  reddit:     { label: 'Reddit', short: 'Reddit', color: '#ff4500', icon: 'MessageCircle' },
  hackernews: { label: 'Hacker News', short: 'HN', color: '#2dd4bf', icon: 'Newspaper' },
  github:     { label: 'GitHub', short: 'GitHub', color: '#a5b4fc', icon: 'Github' },
};

export function dominantSource(bySource = {}) {
  let best = 'reddit', max = -1;
  for (const s of ['reddit', 'hackernews', 'github']) {
    if ((bySource[s] ?? 0) > max) { max = bySource[s] ?? 0; best = s; }
  }
  return best;
}

export const DOMAIN_COLORS = {
  web: '#a855f7', mobile: '#22d3ee', ai: '#f43f5e', database: '#10b981',
  devops: '#f59e0b', languages: '#6366f1', iot: '#84cc16', other: '#6b7280',
};
