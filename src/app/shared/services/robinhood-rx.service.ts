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

    let q: quote = new quote();
    q.symbol = "AAPL";
    this.dataStore.quotes.push(q)

    this._quotes = <BehaviorSubject<quote[]>>new BehaviorSubject([]);
    IntervalObservable.create(30000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.dataStore.quotes && this.dataStore.quotes.length > 0) {
          this.refreshData();
        }
      });
  }

  refreshData() {
    this.http.get("https://api.robinhood.com/quotes/?symbols=" +
      this.dataStore.quotes.map(q => q.symbol).join(","))
      .subscribe(data => { console.log(data) }, 
                  error => console.log('Could not load quotes.'));
  }
}
