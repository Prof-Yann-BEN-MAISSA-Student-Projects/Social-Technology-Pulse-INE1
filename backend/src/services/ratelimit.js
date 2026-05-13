export class RateLimiter {
  #queue = [];
  #running = false;
  #minDelay;

  constructor(minDelayMs = 1000) {
    this.#minDelay = minDelayMs;
  }

  schedule(fn) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ fn, resolve, reject });
      if (!this.#running) this.#run();
    });
  }

  async #run() {
    this.#running = true;
    while (this.#queue.length) {
      const { fn, resolve, reject } = this.#queue.shift();
      try { resolve(await fn()); } catch (e) { reject(e); }
      if (this.#queue.length) await new Promise((r) => setTimeout(r, this.#minDelay));
    }
    this.#running = false;
  }
}

export const redditLimiter     = new RateLimiter(1500);
export const hackerNewsLimiter = new RateLimiter(300);
export const githubLimiter     = new RateLimiter(2000);
