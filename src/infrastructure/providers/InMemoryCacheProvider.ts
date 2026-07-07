import { CacheRegistry } from "#application/providers/CacheRegistry.js";
import { CacheProviderInterface, CacheValueInterface } from "#application/providers/index.js";
import { CacheValue } from "./CacheValue.js";

type CacheNamespace = keyof CacheRegistry;

export class InMemoryCacheProvider<T> implements CacheProviderInterface<T> {
  private static instances: Map<CacheNamespace, InMemoryCacheProvider<keyof CacheRegistry>> = new Map();

  private cache: Map<string | number, CacheValueInterface<T>> = new Map();

  public static getInstance<K extends keyof CacheRegistry>(namespace: CacheNamespace = 'global'): InMemoryCacheProvider<CacheRegistry[K]> {
    if (!InMemoryCacheProvider.instances.has(namespace)) {
      InMemoryCacheProvider.instances.set(namespace, new InMemoryCacheProvider<CacheRegistry[K]>());
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