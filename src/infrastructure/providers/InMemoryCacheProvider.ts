import { CacheProviderInterface, CacheValueInterface } from "#application/providers/index.js";
import { CacheValue } from "./CacheValue.js";

type CacheNamespace = 'global' | 'guild-settings' | 'command-permissions';

export class InMemoryCacheProvider<T> implements CacheProviderInterface<T> {
  private cache: Map<string | number, CacheValueInterface<T>> = new Map();
  private static instances: Map<CacheNamespace, InMemoryCacheProvider<any>> = new Map();

  public static getInstance<T>(namespace: CacheNamespace = 'global'): InMemoryCacheProvider<T> {
    if (!InMemoryCacheProvider.instances.has(namespace)) {
      InMemoryCacheProvider.instances.set(namespace, new InMemoryCacheProvider<T>());
    }

    return InMemoryCacheProvider.instances.get(namespace)!;
  }

  public get(key: string | number): T | null {
    const cacheValue = this.cache.get(key);

    if (!cacheValue || cacheValue.isExpired()) {
      this.cache.delete(key);
      return null;
    }

    return cacheValue.value as T;
  }

  public set(key: string | number, value: T, ttl?: number): void {
    const cacheValue = new CacheValue(value, ttl);

    this.cache.set(key, cacheValue);
  }

  public delete(key: string | number): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}