import { Inject, Injectable } from "@angular/core";
import { SystemService } from "./system.service";
import { APP_BASE_HREF } from "@angular/common";

export type CacheName = "cover" | "breakdown" | "tracks";

@Injectable({ providedIn: "root" })
export class CacheService {
  constructor(
    @Inject(APP_BASE_HREF) private readonly baseHref: string,
    private readonly system: SystemService
  ) {}
  private url(path: string) {
    return new URL(
      path,
      new URL(this.baseHref, this.system.window.location.origin)
    );
  }
  async cache(name: CacheName) {
    const caches = this.system.window.caches;
    const expression = new RegExp(`^ngsw:.+:assets:${name}:cache$`);
    if (caches) {
      const keys = await caches.keys();
      const key = keys.find((key) => expression.test(key));
      if (key) {
        const cache = await caches.open(key);
        if (cache) return cache;
      }
    }
    return;
  }
  async find(cacheName: CacheName, path: string) {
    const cache = await this.cache(cacheName);
    if (cache) {
      let response = await cache.match(path);
      if (response) return response;
      else {
        const url = this.url(path);
        response = await cache.match(url);
        if (response) return response;
      }
    }
    return;
  }
  async exists(cacheName: CacheName, path: string) {
    const response = await this.find(cacheName, path);
    return !!response;
  }
  async remove(cacheName: CacheName, path: string) {
    const response = await this.find(cacheName, path);
    if (response) {
      const cache = await this.cache(cacheName);
      if (cache) {
        const removed = await cache.delete(response.url);
        console.debug("cache:remove", cacheName, response.url, removed);
      }
    }
  }
}
