import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { quote } from '../models/entities';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/map';
import { PreferenceService } from './preference.service';

@Injectable()
export class RobinhoodRxService {
  private _quotes: BehaviorSubject<quote[]>;
  private dataStore: {
    quotes: quote[]
  };
  private forceLoad = true;
  private loading = false;
  private marketAlive = true;

  constructor(private http: HttpClient, private prefSrv:PreferenceService) {
    this.getMarketInfo("XNAS");
    this.dataStore = { quotes: [] };
    this._quotes = <BehaviorSubject<quote[]>>new BehaviorSubject([]);

    IntervalObservable.create(this.prefSrv.appSettings.refreshRate || 3000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.hasQuotesinStore) {
          this.refreshData();
        }
      });
  }
  private publishData() {
    let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
    this._quotes.next(dataStoreCopy.quotes);//copy is to avoid direct reference of dataStore to subs
  }
  getQuotes(symbols: string[]) {
    symbols.forEach(s => {
      if (!this.dataStore.quotes.find(q => q.symbol === s)) {
        let q: quote = new quote();
        q.symbol = s;
        this.dataStore.quotes.push(q);
        this.forceLoad = true;
      }
    });
    return this._quotes.asObservable();
  }
  refreshData() {
    if(document.visibilityState == "hidden"){ return;}
    if (!this.hasQuotesinStore) { console.log('no syms'); return; }
    if (this.loading) { console.log('loading...'); return; }
    if (this.forceLoad || this.marketAlive) 
    {
      this.loading = true;
      this.http.get<QuotesResponse>("https://api.robinhood.com/quotes/?symbols=" +
        this.dataStore.quotes.map(q => q.symbol).join(",")).map(resp => resp.results)
        .subscribe(data => {
          this.loading = false;
          this.dataStore.quotes = data;
          this.publishData();
          this.forceLoad = false;
        },
        error => { console.log('Could not load quotes.'); this.loading = false; },()=>{this.loading = false; })
    }
    //else { console.log('force load'+ this.forceLoad +'or market live'+this.marketAlive); }
  }
  get hasQuotesinStore() {
    return (this.dataStore.quotes.map(q => q.symbol).join(",").length > 0);
  }
  getSymbolName(url) {
    return this.http.get<any>("https://cors-anywhere.herokuapp.com/" + url);
  }
  GetStockQuotes(symbols: string[]) {
    return this.http.
      get<QuotesResponse>("https://api.robinhood.com/quotes/?symbols=" + symbols.join(",")).
      map(resp => resp.results);
  }
  getMarketInfo(market) {
    this.http.get<any>("https://cors-anywhere.herokuapp.com/https://api.robinhood.com/markets/" + market)
      .subscribe(data => { this.updateMarketStatus(data.todays_hours) }, error => { console.log('market info not loaded') });
  }
  updateMarketStatus(url) {
    console.log('Updating Market Status ' + url);
    this.http.get<any>("https://cors-anywhere.herokuapp.com/" + url)
      .subscribe(d => {
        this.marketAlive = d.is_open && ((new Date(d.opens_at).valueOf() < new Date().valueOf())
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
}
interface QuotesResponse {
  results: quote[];
}
