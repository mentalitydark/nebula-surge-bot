import { CacheValueInterface } from "#application/providers/index.js";

export class CacheValue<T> implements CacheValueInterface<T> {
  public readonly value: T;
  public readonly expiresAt: number;
  public readonly ttl?: number;

  constructor(value: T, ttl?: number) {
    this.value = value;
    this.ttl = ttl;
    this.expiresAt = this.generateExpiresAt();
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt;
  }

  generateExpiresAt(): number {
    return this.ttl ? Date.now() + this.ttl : Infinity;
  }
}