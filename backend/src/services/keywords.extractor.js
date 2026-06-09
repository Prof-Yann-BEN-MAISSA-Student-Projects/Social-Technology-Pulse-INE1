const KEYWORDS = [
  // Langages
  'python', 'javascript', 'typescript', 'rust', 'golang', 'java', 'kotlin',
  'swift', 'ruby', 'php', 'scala', 'elixir', 'haskell', 'lua', 'dart', 'zig',
  // Frontend
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix', 'astro',
  'htmx', 'tailwind', 'solidjs',
  // Mobile
  'flutter', 'react native', 'swiftui', 'jetpack compose', 'ionic', 'expo',
  'xamarin', 'android', 'ios', 'capacitor',
  // Hardware / IoT / embarqué
  'arduino', 'esp32', 'raspberry pi', 'micropython', 'platformio',
  // Backend
  'express', 'fastapi', 'django', 'flask', 'spring', 'rails', 'laravel',
  'nestjs', 'fiber', 'gin', 'actix', 'axum',
  // AI / ML
  'llm', 'gpt', 'chatgpt', 'openai', 'claude', 'gemini', 'mistral', 'ollama',
  'pytorch', 'tensorflow', 'keras', 'langchain', 'llamaindex', 'rag',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'transformer',
  'diffusion', 'fine-tuning', 'embedding', 'copilot',
  // DevOps / Cloud
  'docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'azure', 'gcp',
  'linux', 'nginx', 'devops', 'serverless', 'ci/cd',
  // Bases de données
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'elasticsearch',
  'cassandra', 'supabase', 'drizzle', 'prisma',
  // Runtime / Outils
  'nodejs', 'deno', 'bun', 'vite', 'webpack', 'esbuild',
  'webassembly', 'graphql', 'grpc', 'websocket',
  // Sujets généraux
  'open source', 'security', 'microservices', 'blockchain', 'web3',
  'zero-knowledge', 'api', 'cli',
];

const ALIASES = {
  'next.js':       'nextjs',
  'node.js':       'nodejs',
  'solid.js':      'solidjs',
  'tensorflow':    'tensorflow',
  'scikit-learn':  'machine learning',
  'react-native':  'react native',
  'reactnative':   'react native',
  'raspberry-pi':  'raspberry pi',
  'rpi':           'raspberry pi',
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(kw) {
  const escaped = escapeRegex(kw);
  // Word boundaries only for purely alphanumeric keywords (evite false positives sur "go" → "good")
  return /^[a-z0-9]+$/.test(kw) ? `\\b${escaped}\\b` : escaped;
}

const COMPILED = [
  ...KEYWORDS.map((kw) => ({ canonical: kw, re: new RegExp(buildPattern(kw), 'i') })),
  ...Object.entries(ALIASES).map(([alias, canonical]) => ({
    canonical,
    re: new RegExp(buildPattern(alias), 'i'),
  })),
];

export function extractKeywords(text) {
  if (!text) return [];
  const found = new Set();
  for (const { canonical, re } of COMPILED) {
    if (re.test(text)) found.add(canonical);
  }
  return [...found];
}
