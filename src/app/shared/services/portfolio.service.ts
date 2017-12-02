import { Injectable } from '@angular/core';
import { Portfolio, StockPosition, Transaction, quote } from '../models/entities';
import { Portal } from '@angular/cdk/portal';
import { UtilService } from './util.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class PortfolioService {
  readonly CURR_VER = "1";
  private _portfolios: BehaviorSubject<Portfolio[]>;
  private dataStore: {
    portfolios: Portfolio[]
  };
  constructor() {
    this.dataStore = { portfolios: [] };
    this._portfolios = <BehaviorSubject<Portfolio[]>>new BehaviorSubject([]);
    this.loadData();
  }
  get portfolios() {
    return this._portfolios.asObservable();
  }
  loadData() {
    let tempPortfolios = new Array<Portfolio>();
    var jsonObj: Portfolio[] = JSON.parse(localStorage.getItem("eldinero.v1")) as Portfolio[] || [];
    jsonObj.forEach(e => {
      let pos: StockPosition[] = [];
      e.positions = e.positions || [];
      e.positions.forEach(p => {
        p.latestQuote = p.latestQuote || new quote();
        pos.push(Object.assign(new StockPosition(), p))
      });
      e.positions = pos;
      tempPortfolios.push(Object.assign(new Portfolio(), e));
    });
    this.dataStore.portfolios = tempPortfolios;
    this._portfolios.next(Object.assign({}, this.dataStore).portfolios);
    return this.dataStore.portfolios;
  }
  saveData(portfolios: Portfolio[]) {
    localStorage.setItem("eldinero.v" + this.CURR_VER, JSON.stringify(portfolios));
  }
  addPortfolio(name: string) {
    let newPortfolio = new Portfolio();
    newPortfolio.portfolioName = name;
    newPortfolio.id = UtilService.generateGUID();
    newPortfolio.version = this.CURR_VER;
    this.dataStore.portfolios = this.dataStore.portfolios || new Array<Portfolio>();
    this.dataStore.portfolios.push(newPortfolio);
    this.saveData(this.dataStore.portfolios);
    this.dataStore.portfolios = this.loadData();

    this.publishData();
  }
  addTransction(t: Transaction, portfolioId: string) {
    console.log('portfolio service adding trans');
    t.id = UtilService.generateGUID();
    t.date = new Date();
    this.dataStore.portfolios = this.dataStore.portfolios || new Array<Portfolio>();
    this.dataStore.portfolios.forEach((element, index) => {
      if (element.id === portfolioId) {

        element.positions = element.positions || [];
        if (element.positions.find(e => e.symbol === t.symbol)) {
          element.positions.find(e => e.symbol === t.symbol).transactions =
            element.positions.find(e => e.symbol === t.symbol).transactions || [];
          element.positions.find(e => e.symbol === t.symbol).transactions.push(t);
        }
        else {
          var stockPos: StockPosition = new StockPosition();
          stockPos.name = t.name;
          stockPos.symbol = t.symbol;
          stockPos.transactions = [];
          stockPos.transactions.push(t);
          element.positions.push(stockPos);
        }
        this.dataStore.portfolios[index] = element;
      }

      this.saveData(this.dataStore.portfolios);
      this.dataStore.portfolios = this.loadData();

      this.publishData();
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
