/* tslint:disable */
import { Injectable } from '@angular/core';
import { Portfolio, StockPosition, Transaction, quote, TransactionType } from '../models/entities';
import { Portal } from '@angular/cdk/portal';
import { UtilService } from './util.service';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { PreferenceService } from './preference.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PortfolioService {
  readonly CURR_VER = "1";
  private _portfolios: BehaviorSubject<Portfolio[]>;
  private dataStore: {
    portfolios: Portfolio[]
  };
  constructor(private prefSrv: PreferenceService, private http: HttpClient) {
    this.dataStore = { portfolios: [] };
    this._portfolios = <BehaviorSubject<Portfolio[]>>new BehaviorSubject([]);
    this.loadData();
  }
  get portfolios() {
    return this._portfolios.asObservable();
  }
  stockEquityAt(atDate:Date, symbol: string, portfolio: Portfolio){
    let position = portfolio.positions
                    .find(s=>s.symbol==symbol);
    if(position){
      return this.stockEquityInTransactionsAt(atDate,position.transactions);
    }
    return 0;
  }
  stockEquityInTransactionsAt(atDate:Date, transactions: Transaction[]){
    let equity = 0;
    if(transactions){
      //console.log(atDate);
      //console.log( transactions.filter((t)=> new Date(t.date) <= atDate));
      transactions.filter((t)=> new Date(t.date) <= atDate).forEach(
        (t)=>{ 
            equity = equity + Number(t.shares) * ((Number(t.type) == TransactionType.SELL)?-1:1);
         }
      )
    }
    return equity;
  }
  loadData() {
    let tempPortfolios = new Array<Portfolio>();

    var jsonObj: Portfolio[] = [];
    //JSON.parse(localStorage.getItem("eldinero.v" + this.CURR_VER)) as Portfolio[] || [];
    
    let cloudUrl = this.prefSrv.appSettings.cloudurl;
    if (cloudUrl && cloudUrl.length > 1) {
      this.http.get(cloudUrl).subscribe(
        resp => { 
          jsonObj = <Portfolio[]>resp;
          jsonObj.forEach(e => {
            let pos: StockPosition[] = [];
            e.positions = e.positions || [];
            e.positions.forEach(p => {
              p.latestQuote = new quote();
              pos.push(Object.assign(new StockPosition(), p))
            });
            e.positions = pos;
            tempPortfolios.push(Object.assign(new Portfolio(), e));
          });
          this.dataStore.portfolios = tempPortfolios;
          this._portfolios.next(Object.assign({}, this.dataStore).portfolios);
          return this.dataStore.portfolios;
        }
      );
    }
    else {
      this.http.post<any>('https://api.myjson.com/bins',
       JSON.parse(localStorage.getItem('eldinero.v' + this.CURR_VER)) as Portfolio[] || [])
       .subscribe(resp => {
        let appSettings = this.prefSrv.appSettings;
        appSettings.cloudurl = resp.uri;
        console.log(appSettings);
        this.prefSrv.saveData(appSettings);
      });
      jsonObj = JSON.parse(localStorage.getItem('eldinero.v' + this.CURR_VER)) as Portfolio[] || [];
      jsonObj.forEach(e => {
        let pos: StockPosition[] = [];
        e.positions = e.positions || [];
        e.positions.forEach(p => {
          p.latestQuote = new quote();
          pos.push(Object.assign(new StockPosition(), p))
        });
        e.positions = pos;
        tempPortfolios.push(Object.assign(new Portfolio(), e));
      });
      this.dataStore.portfolios = tempPortfolios;
      this._portfolios.next(Object.assign({}, this.dataStore).portfolios);
      return this.dataStore.portfolios;
    }
  }
  saveData(portfolios: Portfolio[]) {
    console.log('saving...');
    //localStorage.setItem("eldinero.v" + this.CURR_VER, JSON.stringify(portfolios));
    return this.http.put<any>(this.prefSrv.appSettings.cloudurl,
      portfolios); //JSON.parse(localStorage.getItem("eldinero.v" + this.CURR_VER)) as Portfolio[] || [])
  }
  getData() {
    return this.dataStore.portfolios;
  }
  addPortfolio(name: string) {
    let newPortfolio = new Portfolio();
    newPortfolio.portfolioName = name;
    newPortfolio.id = UtilService.generateGUID();
    newPortfolio.version = this.CURR_VER;
    this.dataStore.portfolios = this.dataStore.portfolios || new Array<Portfolio>();
    this.dataStore.portfolios.push(newPortfolio);
    this.saveData(this.dataStore.portfolios).subscribe(resp=>{
      this.dataStore.portfolios = this.loadData();
      this.publishData();
    });
  }
  replacePortfolios(portfolios: Portfolio[]) {
    this.dataStore.portfolios = portfolios;
    this.saveData(this.dataStore.portfolios).subscribe(resp=>{
      this.dataStore.portfolios = this.loadData();
      this.publishData();
    });
  }
  addTransction(t: Transaction, portfolioId: string, symbolName: string) {
    console.log('portfolio service adding trans');
    t.id = UtilService.generateGUID();
    //t.date = new Date();
    this.dataStore.portfolios = this.dataStore.portfolios || new Array<Portfolio>();
    this.dataStore.portfolios.forEach((element, index) => {
      if (element.id === portfolioId) {

        element.positions = element.positions || [];
        if (element.positions.find(e => e.symbol === t.symbol)) {
          element.positions.find(e => e.symbol === t.symbol).name = symbolName;
          element.positions.find(e => e.symbol === t.symbol).transactions =
            element.positions.find(e => e.symbol === t.symbol).transactions || [];
          element.positions.find(e => e.symbol === t.symbol).transactions.push(t);
        }
        else {
          var stockPos: StockPosition = new StockPosition();
          stockPos.name = symbolName;
          stockPos.symbol = t.symbol;
          stockPos.transactions = [];
          stockPos.transactions.push(t);
          element.positions.push(stockPos);
        }
        this.dataStore.portfolios[index] = element;
      }

      this.saveData(this.dataStore.portfolios).subscribe(resp=>{
        this.dataStore.portfolios = this.loadData();
        this.publishData();
      });
    });
  }
  private publishData() {
    let dataStoreCopy = Object.assign({}, this.dataStore); // Create a dataStore copy
    this._portfolios.next(dataStoreCopy.portfolios);//copy is to avoid direct reference of dataStore to subs
  }

  removePosition(id: string) {
    this.dataStore.portfolios.forEach((p, i) => {
      if (p.id === id) {
        this.dataStore.portfolios.splice(i, 1);
        this.saveData(this.dataStore.portfolios);
      }
    });
  }
  removeAllPositions() {
    this.dataStore = { portfolios: [] };
    this._portfolios = <BehaviorSubject<Portfolio[]>>new BehaviorSubject([]);
    localStorage.removeItem("eldinero.v" + this.CURR_VER);
    return this;
  }
}
