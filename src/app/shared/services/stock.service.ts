import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions, Jsonp } from '@angular/http';
import { mergeMap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import * as $ from 'jquery';
@Injectable()
export class StockService {
  constructor(private http: Http) { }
  GetTradingAPI(symbols: string[]) {
      return this.http.
        get("https://api.robinhood.com/quotes/?symbols=" + symbols.join(",")).
        map((res: Response) => res.json());
  }
  GetNYSEStatus() {
    return this.http.
      get("https://cors-anywhere.herokuapp.com/https://api.robinhood.com/markets/XNYS/hours/" + this.getFormattedDate(new Date()) + "/").
      map((res: Response) => res.json());
  }
  GetSymbolName(url){
    return this.http.get("https://cors-anywhere.herokuapp.com/"+url).map((res: Response) => res.json());
  }
  getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return year + '-' + month + '-' + day;
  }
}
