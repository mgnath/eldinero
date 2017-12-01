import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { quote } from '../models/entities';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Injectable()
export class RobinhoodRxService {
  private _quotes: BehaviorSubject<quote[]>;
  private dataStore: {
    quotes: quote[]
  };
  private loading = false;
  private marketAlive = true;

  constructor(private http: HttpClient) {
    this.getMarketInfo("XNAS");
    this.dataStore = { quotes: [] };
    this._quotes = <BehaviorSubject<quote[]>>new BehaviorSubject([]);
    IntervalObservable.create(30000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.dataStore.quotes && this.dataStore.quotes.length > 0) {
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
      }
    });
    this.refreshData();
    return this._quotes.asObservable();
  }
  refreshData() {
    if (!this.loading && this.hasQuotesinStore && this.marketAlive) {
      this.loading = true;
      this.http.get<QuotesResponse>("https://api.robinhood.com/quotes/?symbols=" +
        this.dataStore.quotes.map(q => q.symbol).join(",")).map(resp => resp.results)
        .subscribe(data => {
          this.loading = false;
          this.dataStore.quotes = data;
          this.publishData();
        },
        error => { console.log('Could not load quotes.'); this.loading = false; })
    }
    else { console.log('call in progress / no symbols'); }
  }
  get hasQuotesinStore() {
    return (this.dataStore.quotes.map(q => q.symbol).join(",").length > 0);
  }
  getMarketInfo(market) {
    this.http.get<any>("https://cors-anywhere.herokuapp.com/https://api.robinhood.com/markets/" + market)
      .subscribe(data => { this.updateMarketStatus(data.todays_hours) }, error => { console.log('market info not loaded') });
  }
  updateMarketStatus(url) {
    console.log('Updating Market Status');
    this.http.get<any>("https://cors-anywhere.herokuapp.com/" + url)
      .subscribe(d => {
        this.marketAlive = (new Date(d.opens_at).valueOf() < new Date().valueOf())
          && (new Date(d.closes_at).valueOf() > new Date().valueOf());

        if(new Date(d.opens_at).valueOf() > new Date().valueOf())
        {
          var remainingMS = new Date(d.opens_at).valueOf() - new Date().valueOf();
          console.log("market will opens in mins " + (remainingMS/1000)/60)
          setTimeout(()=>{this.updateMarketStatus(url);}, remainingMS);
        }
        if((new Date(d.opens_at).valueOf() < new Date().valueOf())
            && (new Date(d.closes_at).valueOf() > new Date().valueOf()))
        {
          var remainingMS = (new Date(d.closes_at).getTime() - new Date().getTime());
          console.log("market will close in mins " + (remainingMS/1000)/60);
          setTimeout(()=>{this.updateMarketStatus(url);}, remainingMS);
        }
        if(new Date().valueOf() > new Date(d.closes_at).valueOf()){
          var remainingMS = (new Date(d.opens_at).getTime() + 86400000 - new Date().getTime());
          console.log("market will open in mins " + (remainingMS/1000)/60);
          setTimeout(()=>{this.updateMarketStatus(url);}, remainingMS);
        }
      }, error => { console.log('market data not loaded') });
  }
}
interface QuotesResponse {
  results: quote[];
}
