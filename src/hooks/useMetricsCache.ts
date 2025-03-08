import { useState, useCallback } from 'react';

// Generic cache hook for performance metrics
export function useMetricsCache<T>() {
  const [cache, setCache] = useState<Record<string, T>>({});
  
  // Get a value from the cache
  const getCachedValue = useCallback((key: string): T | null => {
    return cache[key] || null;
  }, [cache]);
  
  // Set a value in the cache
  const setCachedValue = useCallback((key: string, value: T): void => {
    setCache(prevCache => ({
      ...prevCache,
      [key]: value
    }));
  }, []);
  
  // Clear the entire cache
  const clearCache = useCallback((): void => {
    setCache({});
  }, []);
  
  // Clear a specific key from the cache
  const clearCacheKey = useCallback((key: string): void => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      delete newCache[key];
      return newCache;
    });
  }, []);
  
  return {
    getCachedValue,
    setCachedValue,
    clearCache,
    clearCacheKey
  };
}