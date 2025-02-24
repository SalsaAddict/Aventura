import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { HomeComponent } from "./home/home.component";
import { CatalogComponent } from "./catalog/catalog.component";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import { CacheService } from "./cache.service";

@NgModule({
  declarations: [AppComponent, HomeComponent, CatalogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: true,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: isDevMode() ? "/" : "/Aventura/",
    },
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(cache: CacheService) {}
}
