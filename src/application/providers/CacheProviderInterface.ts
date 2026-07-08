export interface CacheProviderInterface<T> {
  get(key: string | number): T | null
  /**
   * @param {string | number} key - The key to store the value under.
   * @param {T} value - The value to store.
   * @param {number} [ttl] - The time to live in seconds. If not provided, the value will be stored indefinitely.
   * @returns {void}
   */
  set(key: string | number, value: T, ttl?: number): void
  delete(key: string | number): void
  clear(): void
}