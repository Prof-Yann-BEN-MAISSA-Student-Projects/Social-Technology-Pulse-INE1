export const REDDIT_SUBS = process.env.REDDIT_SUBREDDITS
  ? process.env.REDDIT_SUBREDDITS.split(',').map((s) => s.trim())
  : ['programming', 'technology', 'MachineLearning', 'webdev', 'artificial', 'javascript', 'Python'];

export const REDDIT_SORTS = ['hot', 'rising'];

export const POLL_INTERVALS = {
  reddit:     '*/5 * * * *',
  hackernews: '*/3 * * * *',
  github:     '0 */2 * * *'
};

export const USER_AGENT = process.env.REDDIT_USER_AGENT
  ?? 'SocialPulseINPT/0.1 (Academic project, INPT Morocco)';
