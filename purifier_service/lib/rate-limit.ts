export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];

    // Filter out timestamps that are outside the window
    const recentTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (recentTimestamps.length >= this.maxRequests) {
      // Update the map anyway so we keep tracking their hits
      this.requests.set(ip, recentTimestamps);
      return false; // Rate limit exceeded
    }

    // Add current request
    recentTimestamps.push(now);
    this.requests.set(ip, recentTimestamps);

    return true; // Allowed
  }
}

// Global instance for the Edge / Node runtime
export const globalRateLimiter = new RateLimiter(60, 60 * 1000); // 60 requests per minute
