import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType } from './shared/models/transaction';
import { FinanceService } from './shared/services/finance.service';
import { saveAs } from 'file-saver/FileSaver';
import { StockService } from './shared/services/stock.service';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { UtilService } from './shared/services/util.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() newTransaction: Transaction;
  @Input() importText: string;
  @Input() importJson:string;
  @Input() showAll:boolean;
  positions: StockPosition[];
  alive = true;

  constructor(private financeService: FinanceService, private stockService: StockService, private utilService: UtilService) {
    this.newTransaction = new Transaction("", "", null, null, null, false, null);
    this.InitPositions();
    // get our data every subsequent 10 seconds
    IntervalObservable.create(10000)
      .subscribe(() => {
        if (this.alive) {
          this.getCurrentPrice();
        }
      });
  }
  private InitPositions() {
    this.positions = this.financeService.getAllPositions();
    this.getCurrentPrice();
  }
  getCurrentPrice() {
    var syms = [];
    this.positions.forEach(e => syms.push(e.symbol));
    this.stockService.GetTradingAPI(syms).subscribe(data => {
      data.results.forEach(k => {
        this.positions.find(e => e.symbol === k.symbol).quote = k.last_trade_price;
        this.positions.find(e => e.symbol === k.symbol).adjusted_previous_close = k.adjusted_previous_close;
      });
    });
  }
  updateTickers() { }

  importTransactions() {
    var transactions = this.utilService.CSVToArray(this.importText, null);
    transactions.forEach(trans => {
      let currTrans: Transaction = new Transaction(trans[1], trans[0], new Date(trans[3]), TransactionType.BUY, <number>(trans[4]), false, <number>(trans[5]));
      this.addTrans(currTrans);
      this.positions = this.financeService.getAllPositions();
    });
  }
  importJsonTrans(){
    var transactions = JSON.parse(this.importJson);
    transactions.forEach(trans => {      
      this.addTrans(trans);
      this.positions = this.financeService.getAllPositions();
    });
  }
  addTransaction(trans: Transaction) {
    this.newTransaction.type = TransactionType.BUY;
    this.positions = this.financeService.addTransction(trans).getAllPositions();
    this.newTransaction = new Transaction("", "", null, null, 0, false, 0);
  }
  addTrans(trans: Transaction) {
    this.positions = this.financeService.addTransction(trans).getAllPositions();
  }
  removeAll() {
    this.positions = this.financeService.removeAllPositions().getAllPositions();
  }
  SaveAsFile(textToBeSaved: string) {
    var allTrans = [];
    this.financeService.getAllPositions().forEach( e => e.transactions.forEach(t=>allTrans.push(t)));   
    this.utilService.SaveAsFile(JSON.stringify(allTrans), "myportfolio.json");
  }
  //helper functions
  getSum(trans: Transaction[]) {
    var sum = trans.reduce(function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return sum;
  }
  getAvg(trans: Transaction[]) {
    var totalPrice = trans.reduce(function (p, c, i) {
      return Number(p) + (Number(c.price) * Number(c.shares));
    }, 0);
    var totalShares = trans.reduce(
      function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return Math.round((totalPrice / totalShares) * 1000) / 1000;
  }
  getTotalGain(p: StockPosition) {
    return (p.quote * this.getSum(p.transactions) - (this.getAvg(p.transactions) * this.getSum(p.transactions)))
  }
  getGrandTotalGain() {
    var totSum: number = 0;
    this.positions.forEach(
      pos => (
        totSum +=
        pos.quote * this.getSum(pos.transactions) -
        (this.getAvg(pos.transactions) * this.getSum(pos.transactions)))
    );
    return totSum;
  }
}