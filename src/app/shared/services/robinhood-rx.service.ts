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
  constructor(private http: HttpClient) {
    this.dataStore = { quotes: [] };
    this._quotes = <BehaviorSubject<quote[]>>new BehaviorSubject([]);
    IntervalObservable.create(10000)// get our data every subsequent 10 seconds
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
    return this._quotes.asObservable();
  }
  refreshData() {
    this.http.get<QuotesResponse>("https://api.robinhood.com/quotes/?symbols=" +
      this.dataStore.quotes.map(q => q.symbol).join(",")).map(resp => resp.results)
      .subscribe(data => {
        this.dataStore.quotes = data;
        this.publishData();
      },
      error => console.log('Could not load quotes.'));
  }
}
interface QuotesResponse {
  results: quote[];
}
