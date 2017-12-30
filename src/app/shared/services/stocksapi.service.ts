import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { from } from 'rxjs/observable/from';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { PreferenceService } from './preference.service';
import { StocksRepoService } from './stocks-repo.service';
import * as moment from 'moment';

@Injectable()
export class StocksApiService implements IStocksApi {
  private _stocks: BehaviorSubject<Stock[]>;
  private _latestPrices: BehaviorSubject<StockPrice[]>;
  private _history: BehaviorSubject<StockPrice[]>;
  private _marketStatus: BehaviorSubject<boolean>;


  private loadingLatest: boolean = false;
  private forceLoad = true;

  private dataStore: {
    stocks: Stock[],
    latestPrices: StockPrice[],
    history: StockPrice[],
    marketStatus: boolean
  };
  constructor(private http: HttpClient, private prefSrv: PreferenceService, private repoSrv: StocksRepoService) {
    console.log('StocksApiServie started');
    this.dataStore = {
      history: repoSrv.getArchive() || new Array<StockPrice>(),
      latestPrices: [],
      stocks: JSON.parse(localStorage.getItem('eld_stocksInfo')) || [],
      marketStatus: false
    };
    this._latestPrices = <BehaviorSubject<StockPrice[]>>new BehaviorSubject([]);
    this._stocks = <BehaviorSubject<Stock[]>>new BehaviorSubject([]);
    this._history = <BehaviorSubject<StockPrice[]>>new BehaviorSubject([]);
    this._marketStatus = new BehaviorSubject<boolean>(false);
    this.getMarketInfo("XNAS");
    this.LoadData();
  }

  /* getHistory(symbol: string, start: Date, end: Date): Observable<StockPrice[]> {
    if (!this.dataStore.stocks.find(stock => stock.sym === symbol)) {
      let stock: Stock = new Stock();
      stock.sym = symbol;
      this.dataStore.stocks.push(stock);
    }
    return this._history.asObservable();
  } */

  getHistoryInterval(symbol: string, start: Date, end: Date, intervalInMins: number): StockPrice[] {
    let resp: StockPrice[] = [];
    if (start <= end && intervalInMins > 0 && this.dataStore.history) {
      let tempstart = moment(start);
      let tempEnd= moment(start).add(intervalInMins,'m');
      while( tempEnd <= moment(end)){
        resp.push(
          this.dataStore.history.find(sp => {
          return sp.sym == symbol
            && moment(sp.t) >= tempstart
            && moment(sp.t) < tempEnd;
        }));
        tempstart = tempEnd;
        tempEnd = tempEnd.add(intervalInMins,'m');
      }
      return resp;
    }
    return null;
  }
  getHistory(symbol: string, start: Date, end: Date, intervalInMins: number): StockPrice[] {
    if (start <= end && this.dataStore.history) {
      return this.dataStore.history.filter(sp => {
        return sp.sym == symbol
          && new Date(sp.t).valueOf() >= start.valueOf()
          && new Date(sp.t).valueOf() <= end.valueOf()
      });
    } else { return []; }
  }

  getLatestPrice(symbols: string[]): Observable<StockPrice[]> {
    symbols.forEach(s => {
      if (!this.dataStore.stocks.find(stock => stock.sym === s)) {
        let stock: Stock = new Stock();
        stock.sym = s;
        this.dataStore.stocks.push(stock);
        this.forceLoad = true;
      }
    });
    return this._latestPrices.asObservable();
  }
  checkSymbols(symbols: string[]): Observable<Stock[]> {
    symbols.forEach(s => {
      if (!this.dataStore.stocks.find(stock => stock.sym === s)) {
        let stock: Stock = new Stock();
        stock.sym = s;
        this.dataStore.stocks.push(stock);
      }
    });
    this.forceLoad = true;
    this.refreshLatestPrices();
    return this._stocks;
  }
  publishLatestPrices() {
    let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
    this._latestPrices.next(dataStoreCopy.latestPrices);//copy is to avoid direct reference of dataStore to subs
  }
  publishHistory() {
    //console.log(this.dataStore.history);
    let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
    this._history.next(dataStoreCopy.history);//copy is to avoid direct reference of dataStore to subs
  }
  LoadData() {
    IntervalObservable.create(this.prefSrv.appSettings.refreshRate || 6000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.hasStocksinStore) {
          this.refreshLatestPrices();
        }
      });
  }
  refreshLatestPrices() {
    if (this.cantMakeAPICall()) { return; }
    if (this.loadingLatest) { console.log('loading...'); return; }
    if (this.forceLoad || this.dataStore.marketStatus) {
      this.loadingLatest = true;
      this.http.get<any>("https://api.robinhood.com/quotes/?symbols=" +
        this.dataStore.stocks.map(q => q.sym).join(","))
        .subscribe(data => {
          this.loadingLatest = false;
          this.dataStore.latestPrices = [];
          data.results.forEach(q => {
            var res = this.dataStore.latestPrices.find(lp => lp.sym == q.symbol);
            //console.log(this.dataStore.latestPrices);
            if (res) {
              res = StockPrice.convert(q);
            }
            else { this.dataStore.latestPrices.push(StockPrice.convert(q)); }
            this.addToHistory(StockPrice.convert(q));
            this.updateStockInfo(q);
          });
          //console.log(this.dataStore.latestPrices);
          this.publishLatestPrices();

          this.forceLoad = false;
        },
        error => { console.log('Could not load quotes.'); this.loadingLatest = false; }, () => { this.loadingLatest = false; })
    }
  }
  private addToHistory(sp: StockPrice) {
    if (this.repoSrv.saveStockPrice(sp)) {
      this.dataStore.history = this.repoSrv.getArchive();
      this.publishHistory();
    }
  }
  private updateStockInfo(quote: any) {
    var stk = this.dataStore.stocks.find(lp => lp.sym == quote.symbol);
    if (stk.name) { return; }
    this.http.get<any>("https://cors-anywhere.herokuapp.com/" + quote.instrument)
      .subscribe(
      data => {
        stk.name = data.simple_name || data.name;
        localStorage.setItem('eld_stocksInfo', JSON.stringify(this.dataStore.stocks));

        let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
        this._stocks.next(dataStoreCopy.stocks);//copy is to avoid direct reference of dataStore to subs

      },
      e => { console.log(e); }
      )
  }
  trackMarketStatus() {
    this.getMarketInfo('XNAS');
    return this._marketStatus.asObservable();
  }
  getMarketInfo(market) {
    this.http.get<any>("https://cors-anywhere.herokuapp.com/https://api.robinhood.com/markets/" + market)
      .subscribe(data => { this.updateMarketStatus(data.todays_hours) }, error => { console.log('market info not loaded') });
  }
  updateMarketStatus(url) {
    console.log('Stocks API Market Status ' + url);
    this.http.get<any>("https://cors-anywhere.herokuapp.com/" + url)
      .subscribe(d => {
        this.dataStore.marketStatus = d.is_open && ((new Date(d.opens_at).valueOf() < new Date().valueOf())
          && (new Date(d.closes_at).valueOf() > new Date().valueOf()));
        if (!d.is_open) {
          this.updateMarketStatus(d.next_open_hours); return;
        }
        else {
          var remainingMS = (new Date(d.closes_at).getTime() - new Date().getTime());
          if (new Date(d.opens_at).valueOf() > new Date().valueOf()) {
            var remainingMS = new Date(d.opens_at).valueOf() - new Date().valueOf();
          }
          if ((new Date(d.opens_at).valueOf() < new Date().valueOf())
            && (new Date(d.closes_at).valueOf() > new Date().valueOf())) {
            var remainingMS = (new Date(d.closes_at).getTime() - new Date().getTime());
          }
          if (new Date().valueOf() > new Date(d.closes_at).valueOf()) {
            this.updateMarketStatus(d.next_open_hours); return;
          }
          console.log("market will open/close in hrs " + ((remainingMS / 1000) / 3600).toFixed(2));
          setTimeout(() => { this.updateMarketStatus(url); }, remainingMS);
        }
      }, error => { console.log('market data not loaded') });
  }

  private cantMakeAPICall(): boolean {
    //if (document.visibilityState == "hidden") { return true; }
    if (!navigator.onLine) { console.log('No Internet'); return true; }
    if (!this.hasStocksinStore) { console.log('no syms'); return true; }
    return false;
  }
  get hasStocksinStore() {
    return (this.dataStore.stocks.map(q => q.sym).join(",").length > 0);
  }
}







interface IStocksApi {
  //getHistory(symbol: string, start: Date, end: Date): Observable<StockPrice[]>;
  getLatestPrice(symbols: string[]): Observable<StockPrice[]>;
  checkSymbols(symbols: string[]): Observable<Stock[]>;
}
export class StockPrice {
  sym: string;
  t: Date;
  adjprice: number;
  price: number;
  vol: number;
  prev_close: number;
  constructor() { }
  static convert(raw: any): StockPrice {
    let sp = new StockPrice();
    sp.sym = raw.symbol;
    sp.t = raw.updated_at;
    sp.price = raw.last_trade_price;
    sp.prev_close = raw.adjusted_previous_close;
    return sp;
  }
}
export class Stock {
  sym: string;
  name: string;
  constructor() { }
}
