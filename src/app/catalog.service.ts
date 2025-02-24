import { Injectable } from "@angular/core";
import { CacheService } from "./cache.service";
import { HttpClient } from "@angular/common/http";
import { IBreakdown, ISong, ISongs } from "../../schema/schema";
import { SystemService } from "./system.service";
import { firstValueFrom } from "rxjs";

@Injectable({ providedIn: "root" })
export class CatalogService {
  constructor(
    private readonly http: HttpClient,
    private readonly system: SystemService,
    private readonly cache: CacheService
  ) {}
  readonly songs: CatalogService.Song[] = [];
  async load() {
    const iSongs = await firstValueFrom(this.http.get<ISongs>("songs.json"));
    Object.keys(iSongs).forEach(async (id) => {
      const path = `songs/${id}`;
      let song: CatalogService.Song = {
        id,
        path,
        cover: `songs/${id}/cover.jpg`,
        breakdown: `songs/${id}/breakdown.json`,
        tracks: [],
        ...iSongs[id],
        offline: false,
        downloading: false,
      };
      const breakdown = await firstValueFrom(
        this.http.get<IBreakdown>(song.breakdown)
      );
      if (breakdown) {
        for (let i = 0; i < breakdown.tracks.length; i++) {
          song.tracks.push(`songs/${id}/track${i}.trk`);
        }
      }
      song.offline = await this.isOffline(song);
      this.songs.push(song);
    });
  }
  async isOffline(song: CatalogService.Song) {
    let offline = false;
    if (await this.cache.exists("cover", song.cover)) {
      if (await this.cache.exists("breakdown", song.breakdown)) {
        if (song.tracks.length) {
          offline = true;
          for (const track of song.tracks) {
            if (!(await this.cache.exists("tracks", track))) {
              offline = false;
              break;
            }
          }
        }
      }
    }
    return offline;
  }
  async download(song: CatalogService.Song) {
    song.downloading = true;
    if (!(await this.cache.exists("cover", song.cover))) {
      await firstValueFrom(this.http.get(song.cover, { responseType: "blob" }));
    }
    if (!(await this.cache.exists("breakdown", song.breakdown))) {
      await firstValueFrom(this.http.get(song.breakdown));
    }
    for (const track of song.tracks) {
      if (!(await this.cache.exists("tracks", track))) {
        await firstValueFrom(this.http.get(track, { responseType: "blob" }));
      }
    }
    song.offline = await this.isOffline(song);
    song.downloading = false;
  }
  async remove(song: CatalogService.Song) {
    await this.cache.remove("breakdown", song.breakdown);
    for (const track of song.tracks) {
      await this.cache.remove("tracks", track);
    }
    song.offline = await this.isOffline(song);
  }
}

export namespace CatalogService {
  export interface Song extends ISong {
    id: string;
    path: string;
    cover: string;
    breakdown: string;
    tracks: string[];
    offline: boolean;
    downloading: boolean;
  }
}
