// Performance optimization utilities

// Type definitions for better type safety
interface CacheEntry<T> {
  data: T;
  expiryTime: number;
}

interface PerformanceOptimizerConfig {
  defaultCacheExpiryMinutes: number;
  autoCleanupIntervalMinutes: number;
  maxCacheSize: number;
}

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  activeEntries: number;
  memoryUsage?: number;
}

/**
 * Performance optimization utilities for caching, debouncing, and memory management.
 *
 * This module provides utilities to optimize application performance through:
 * - Intelligent caching with automatic expiry
 * - Debounced function calls to prevent excessive API calls
 * - Memory management and cleanup
 * - Performance monitoring and statistics
 *
 * @example
 * ```typescript
 * const optimizer = createPerformanceOptimizer();
 *
 * // Debounce expensive operations
 * const debouncedSearch = optimizer.debounce(searchFunction, 300, 'search');
 *
 * // Cache expensive results
 * optimizer.setCache('user-data', userData, 10);
 * const cachedData = optimizer.getCached<UserData>('user-data');
 * ```
 */

// Create performance optimizer with configuration
export function createPerformanceOptimizer(): ReturnType<
  typeof createPerformanceOptimizerInstance
> {
  return createPerformanceOptimizerInstance();
}

function createPerformanceOptimizerInstance() {
  // Configuration
  const config: PerformanceOptimizerConfig = {
    defaultCacheExpiryMinutes: 5,
    autoCleanupIntervalMinutes: 10,
    maxCacheSize: 1000,
  };

  // Internal state
  const debounceTimers = new Map<string, NodeJS.Timeout>();
  const dataCache = new Map<string, CacheEntry<unknown>>();
  let cleanupInterval: NodeJS.Timeout | null = null;

  // Initialize auto-cleanup if in browser environment
  if (typeof window !== "undefined") {
    cleanupInterval = setInterval(() => {
      cleanupCache();
    }, config.autoCleanupIntervalMinutes * 60 * 1000);
  }

  /**
   * Debounce function calls to prevent excessive API calls
   *
   * @param func - The function to debounce
   * @param delay - Delay in milliseconds
   * @param key - Unique key for this debounced function
   * @returns Debounced function
   */
  function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number,
    key: string
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear existing timer
      if (debounceTimers.has(key)) {
        const existingTimer = debounceTimers.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
      }

      // Set new timer
      const timer = setTimeout(() => {
        func(...args);
        debounceTimers.delete(key);
      }, delay);

      debounceTimers.set(key, timer);
    };
  }

  /**
   * Simple caching mechanism with expiry
   *
   * @param key - Cache key
   * @param data - Data to cache
   * @param expiryMinutes - Expiry time in minutes (default: 5)
   */
  function setCache<T>(
    key: string,
    data: T,
    expiryMinutes: number = config.defaultCacheExpiryMinutes
  ): void {
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;

    // Check cache size limit
    if (dataCache.size >= config.maxCacheSize) {
      // Remove oldest entries to make space
      const entries = Array.from(dataCache.entries());
      entries.sort((a, b) => a[1].expiryTime - b[1].expiryTime);

      // Remove 10% of oldest entries
      const entriesToRemove = Math.ceil(config.maxCacheSize * 0.1);
      for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        dataCache.delete(entries[i][0]);
      }
    }

    dataCache.set(key, { data, expiryTime });
  }

  /**
   * Get cached data if not expired
   *
   * @param key - Cache key
   * @returns Cached data or null if expired/not found
   */
  function getCached<T>(key: string): T | null {
    const entry = dataCache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiryTime) {
      dataCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists in cache and is not expired
   *
   * @param key - Cache key
   * @returns True if cached data exists and is valid
   */
  function hasCached(key: string): boolean {
    const entry = dataCache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiryTime) {
      dataCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear expired cache entries
   */
  function cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of dataCache.entries()) {
      if (now > entry.expiryTime) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    for (const key of expiredKeys) {
      dataCache.delete(key);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  function getCacheStats(): CacheStats {
    const now = Date.now();
    let expiredCount = 0;
    let activeCount = 0;

    for (const entry of dataCache.values()) {
      if (now > entry.expiryTime) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalEntries: dataCache.size,
      expiredEntries: expiredCount,
      activeEntries: activeCount,
      memoryUsage:
        typeof performance !== "undefined" && "memory" in performance
          ? (performance as { memory?: { usedJSHeapSize?: number } }).memory
              ?.usedJSHeapSize
          : undefined,
    };
  }

  /**
   * Clear all cache and timers
   */
  function clearAll(): void {
    dataCache.clear();

    for (const timer of debounceTimers.values()) {
      clearTimeout(timer);
    }
    debounceTimers.clear();
  }

  /**
   * Clear specific cache entry
   *
   * @param key - Cache key to clear
   */
  function clearCache(key: string): void {
    dataCache.delete(key);
  }

  /**
   * Clear debounced function timer
   *
   * @param key - Debounce key to clear
   */
  function clearDebounce(key: string): void {
    const timer = debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.delete(key);
    }
  }

  /**
   * Get all active debounce keys
   *
   * @returns Array of active debounce keys
   */
  function getActiveDebounceKeys(): string[] {
    return Array.from(debounceTimers.keys());
  }

  /**
   * Get all cache keys
   *
   * @returns Array of cache keys
   */
  function getCacheKeys(): string[] {
    return Array.from(dataCache.keys());
  }

  /**
   * Dispose of the optimizer and clean up resources
   */
  function dispose(): void {
    clearAll();
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  }

  // Return the public API
  return {
    debounce,
    setCache,
    getCached,
    hasCached,
    cleanupCache,
    getCacheStats,
    clearAll,
    clearCache,
    clearDebounce,
    getActiveDebounceKeys,
    getCacheKeys,
    dispose,
  };
}

// Export a singleton instance for backward compatibility
export const performanceOptimizer = createPerformanceOptimizer();
