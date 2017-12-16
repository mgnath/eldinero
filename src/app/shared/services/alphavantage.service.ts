import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class AlphavantageService {
  readonly API_KEY = "O22XVPSPMRTX7OGT";
  readonly BASEURL = "https://www.alphavantage.co/query?";

  constructor(private http: HttpClient) { }

  getStockSME(symbol: string): Observable<any> {
    var params = new HttpParams().set("function", "SMA")
      .set("symbol", symbol)
      .set("interval", "15min")
      .set("time_period", "10")
      .set("series_type", "close")
      .set("apikey", this.API_KEY);
    return this.http.get(this.BASEURL, { params });
  }

  //https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&apikey=demo



  getHistoricalData(symbol: string, range:string): Observable<any> {
    var cacheData = JSON.parse(localStorage.getItem(symbol + '_Hist'));
    if (cacheData) {
      var LastRefreshed: Date = new Date(cacheData["Meta Data"]["3. Last Refreshed"]);
      if ((new Date().valueOf() - LastRefreshed.valueOf() < 3600000)){
        //console.log('from cache');
        cacheData["isCache"] = true;
        return Observable.of(cacheData);
      }
    }
    //console.log('hot call');
    var params = new HttpParams().set("function", range)// "TIME_SERIES_MONTHLY_ADJUSTED")// TIME_SERIES_MONTHLY "TIME_SERIES_DAILY_ADJUSTED")
      .set("symbol", symbol)
      .set("apikey", this.API_KEY);
    return this.http.get(this.BASEURL, { params });
  }

}
