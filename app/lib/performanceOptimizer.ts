// Performance optimization utilities

export class PerformanceOptimizer {
  private static debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private static dataCache: Map<string, unknown> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();

  /**
   * Debounce function calls to prevent excessive API calls
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number,
    key: string
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear existing timer
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key)!);
      }

      // Set new timer
      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    };
  }

  /**
   * Simple caching mechanism with expiry
   */
  static setCache<T>(key: string, data: T, expiryMinutes: number = 5): void {
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
    this.dataCache.set(key, data);
    this.cacheExpiry.set(key, expiryTime);
  }

  /**
   * Get cached data if not expired
   */
  static getCached<T>(key: string): T | null {
    const expiryTime = this.cacheExpiry.get(key);
    if (!expiryTime || Date.now() > expiryTime) {
      this.dataCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return (this.dataCache.get(key) as T) || null;
  }

  /**
   * Clear expired cache entries
   */
  static cleanupCache(): void {
    const now = Date.now();
    for (const [key, expiryTime] of this.cacheExpiry.entries()) {
      if (now > expiryTime) {
        this.dataCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Clear all cache and timers
   */
  static clearAll(): void {
    this.dataCache.clear();
    this.cacheExpiry.clear();
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

// Auto-cleanup cache every 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    PerformanceOptimizer.cleanupCache();
  }, 10 * 60 * 1000);
}
