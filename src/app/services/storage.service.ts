import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private cookie: CookieService) { }

  addCookie(key: string, value: string): void {
    this.cookie.set(key, value);
  }

  updateCookie(key: string, value: string): void {
    this.deleteCookie(key);
    this.addCookie(key, value);
  }

  deleteCookie(key: string): void {
    this.cookie.delete(key);
  }

  getCookie(key: string): string {
    return this.cookie.get(key);
  }

  checkCookie(key: string): boolean {
    return this.cookie.check(key);
  }
}
