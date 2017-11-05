import { Injectable } from '@angular/core';
import { Transaction, TransactionType, StockPosition } from '../models/transaction';
import { UtilService } from './util.service';


@Injectable()
export class FinanceService {
  positions: StockPosition[];
  constructor(private util: UtilService) {
    this.positions = JSON.parse(localStorage.getItem("eldinero")) as StockPosition[]
      || [];
  }
  importPositions(positions: StockPosition[]) {
    this.positions = positions;
  }
  getAllPositions(): StockPosition[] { return this.positions.sort((a,b)=>{
                return a.name.localeCompare(b.name);}) }
  removeAllPositions() {
    this.positions = [];
    localStorage.clear();
    return this;
  }
  addTransction(t: Transaction) {
    t.id = this.util.generateGUID();
    t.date = new Date();
    this.positions = this.positions || [];
    if (this.positions.find(e => e.symbol === t.symbol)) {
      this.positions.find(e => e.symbol === t.symbol).transactions =
        this.positions.find(e => e.symbol === t.symbol).transactions || [];
      this.positions.find(e => e.symbol === t.symbol).transactions.push(t);
    }
    else {
      var stockPos: StockPosition = new StockPosition(this.util);
      stockPos.name = t.name;
      stockPos.symbol = t.symbol;
      stockPos.transactions = [];
      stockPos.transactions.push(t);
      this.positions.push(stockPos);
    }
    localStorage.setItem("eldinero", JSON.stringify(this.positions));
    return this;
  }
}
