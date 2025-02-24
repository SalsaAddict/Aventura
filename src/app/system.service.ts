import { APP_BASE_HREF, DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class SystemService {
  constructor(
    @Inject(DOCUMENT) readonly document: Document,
    private readonly toastr: ToastrService
  ) {
    this.isOnline = this.window.navigator.onLine;
    this.window.addEventListener("online", () => {
      this.toastr.success("Internet connection restored");
      this.isOnline = true;
    });
    this.window.addEventListener("offline", () => {
      this.toastr.error("No internet connection");
      this.isOnline = false;
    });
  }
  get window() {
    return this.document.defaultView!;
  }
  private isOnline: boolean;
  get online() {
    return this.isOnline;
  }
  get offline() {
    return !this.isOnline;
  }
}
