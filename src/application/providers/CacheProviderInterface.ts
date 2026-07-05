export interface CacheProviderInterface<T> {
  get(key: string | number): T | null
  set(key: string | number, value: T, ttl?: number): void
  delete(key: string | number): void
  clear(): void
}