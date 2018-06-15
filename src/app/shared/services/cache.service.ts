import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  constructor() { }
  setCache(key: string, expiresAt: Date, data: any) {
    const payLoad: CachedData = new CachedData();
    payLoad.lastUpdatedAt = new Date();
    payLoad.expiresAt = expiresAt;
    payLoad.data = data;
    localStorage.setItem(key, JSON.stringify(payLoad));
  }
  getCache(key: string): any {
    const payLoad: CachedData = JSON.parse(localStorage.getItem(key));
    if (payLoad && new Date(payLoad.expiresAt) >= new Date()) {
      return payLoad.data;
    }
  }
}
export class CachedData {
  lastUpdatedAt: Date;
  expiresAt: Date;
  data: any;
}
