/**
 * Format unifié pour toutes les sources :
 * { id, title, url, score, source, fetchedAt, meta }
 */

export function normalizeReddit(post, subreddit) {
  const d = post.data;
  return {
    id:        `reddit_${d.id}`,
    title:     d.title,
    url:       d.url,
    score:     d.score,
    source:    'reddit',
    fetchedAt: new Date().toISOString(),
    meta: {
      subreddit,
      comments:  d.num_comments,
      sort:      d._sort ?? 'hot',
      author:    d.author,
      permalink: `https://reddit.com${d.permalink}`
    }
  };
}

export function normalizeHackerNews(item) {
  return {
    id:        `hn_${item.id}`,
    title:     item.title,
    url:       item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
    score:     item.score ?? 0,
    source:    'hackernews',
    fetchedAt: new Date().toISOString(),
    meta: {
      comments: item.descendants ?? 0,
      author:   item.by,
      type:     item.type
    }
  };
}

export function normalizeGitHub(repo) {
  return {
    id:        `github_${repo.id}`,
    title:     repo.full_name,
    url:       repo.html_url,
    score:     repo.stargazers_count,
    source:    'github',
    fetchedAt: new Date().toISOString(),
    meta: {
      description: repo.description,
      language:    repo.language,
      forks:       repo.forks_count,
      openIssues:  repo.open_issues_count,
      pushedAt:    repo.pushed_at,
      topics:      repo.topics ?? []
    }
  };
}
