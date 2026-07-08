export interface CacheValueInterface<T> {
  value: T
  expiresAt: number
  ttl?: number
  isExpired(): boolean
  generateExpiresAt(): number
}