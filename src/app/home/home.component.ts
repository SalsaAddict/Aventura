import { Component, OnInit } from "@angular/core";
import { CatalogService } from "../catalog.service";

@Component({
  selector: "app-home",
  standalone: false,
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  constructor(readonly catalog: CatalogService) {}
  async ngOnInit() {
    await this.catalog.load();
  }
  async toggle(song: CatalogService.Song) {
    if (song.downloading) return;
    if (song.offline) {
      await this.catalog.remove(song);
    } else {
      await this.catalog.download(song);
    }
  }
}
