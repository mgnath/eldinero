import { Injectable } from '@angular/core';
// import { LokiService } from 'angular2-loki';

@Injectable()
export class StocksApiService {
  private stocksData: any;
  constructor() {
    // let db = loki.init('stocksdb.json');
    // this.stocksData = db.addCollection('stocks');
  }

}
export class Stock {
  id: string;
  sym: string;
  mkt: string;
  t: Date;
  price: number;
  vol: number;
  constructor() { }
}
