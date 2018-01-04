import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MarketService {
  private _marketStatus: BehaviorSubject<MarketInfo>;
  private dataStore: {
    marketStatus: MarketInfo
  };
  constructor(private http: HttpClient) {
    this.dataStore = { marketStatus:{isOpen: false, opens_at :null,closes_at:null}};
    this._marketStatus = new BehaviorSubject<MarketInfo>({isOpen: false, opens_at :null,closes_at:null});
    this.getMarketInfo("XNAS",http);
  }
  public getMarketStatus(): BehaviorSubject<MarketInfo> {
    return this._marketStatus;
  }
  private getMarketInfo(market, http: HttpClient ) {
    http.get<any>("https://cors-anywhere.herokuapp.com/https://api.robinhood.com/markets/" + market)
      .subscribe(
        data => { this.updateMarketStatus(data.todays_hours,http) },
        error => { console.log('market info not loaded') }
      );
  }
  publishMktStatus() {
    let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
    this._marketStatus.next(dataStoreCopy.marketStatus);//copy is to avoid direct reference of dataStore to subs
  }
  private updateMarketStatus(url, http: HttpClient) {
    console.log('Market Service started ' + url);
    http.get<any>("https://cors-anywhere.herokuapp.com/" + url)
      .subscribe(d => {
        this.dataStore.marketStatus = {
          isOpen : d.is_open 
          && (new Date(d.opens_at).valueOf() < new Date().valueOf())
          && (new Date(d.closes_at).valueOf() > new Date().valueOf()),
          opens_at: d.opens_at,
          closes_at: d.closes_atxw
        };
        this.publishMktStatus();
        if (!d.is_open) {
          this.updateMarketStatus(d.next_open_hours,http); return;
        }
        else {
          var remainingMS = (new Date(d.closes_at).getTime() - new Date().getTime());
          if (new Date(d.opens_at).valueOf() > new Date().valueOf()) {
            var remainingMS = new Date(d.opens_at).valueOf() - new Date().valueOf();
          }
          if ((new Date(d.opens_at).valueOf() < new Date().valueOf())
            && (new Date(d.closes_at).valueOf() > new Date().valueOf())) {
            var remainingMS = new Date(d.closes_at).getTime() - new Date().getTime();
          }
          if (new Date().valueOf() > new Date(d.closes_at).valueOf()) {
            this.updateMarketStatus(d.next_open_hours,http); return;
          }
          console.log("market will open/close in hrs " + ((remainingMS / 1000) / 3600).toFixed(2));
          setTimeout(() => { this.updateMarketStatus(url,http); }, remainingMS);
        }
      }, error => { console.log('market data not loaded') });
  }
}

interface MarketInfo{
  opens_at:Date;
  isOpen:Boolean;
  closes_at:Date;
}
