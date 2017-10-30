import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType } from './shared/models/transaction';
import { FinanceService } from './shared/services/finance.service';
import { saveAs } from 'file-saver/FileSaver';
import { StockService } from './shared/services/stock.service';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() newTransaction: Transaction;
  @Input() importText: string;
  @Input() symbol: string;
  @Input() rawData: string;
  positions: StockPosition[];
  alive = true;

  constructor(private financeService: FinanceService, private stockService: StockService) {
    this.newTransaction = new Transaction("", "", null, null, null, false, null);
    this.InitPositions();
    // get our data every subsequent 10 seconds
    IntervalObservable.create(10000)
      .subscribe(() => {
        if(this.alive){
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
      });
    });
  }
  updateTickers() { }

  importTransactions() {
    var transactions = this.CSVToArray(this.importText,null);
    transactions.forEach(trans=>{
        let currTrans:Transaction = new Transaction("", "", null, null, 0, false, 0);
        currTrans.symbol  = trans[0];
        currTrans.name = trans[1];
        currTrans.date = new Date(trans[3]);
        currTrans.shares =  <number>(trans[4]);
        currTrans.price =  <number>(trans[5]);
        this.addTrans(currTrans);
    });
  }
  addTransaction() {
    this.newTransaction.type = TransactionType.BUY;
    this.positions = this.financeService.addTransction(this.newTransaction).getAllPositions();
    this.newTransaction = new Transaction("", "", null, null, 0, false, 0);
  }
  addTrans(trans:Transaction){
    this.positions = this.financeService.addTransction(trans).getAllPositions();
  }
  removeAll() {
    this.positions = this.financeService.removeAllPositions().getAllPositions();
  }
  SaveAsFile() {
    var text = JSON.stringify(this.financeService.getAllPositions());
    var filename = "myportfolio";
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename + ".txt");
  }
  //helper functions
  getSum(trans: Transaction[]) {
    var sum = trans.reduce(function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return sum;
  }
  getAvg(trans: Transaction[]) {
    var totalPrice = trans.reduce(function (p, c, i) {
      return Number(p) + (Number(c.price) * Number(c.shares))
    }, 0);
    var totalShares = trans.reduce(
      function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return Math.round((totalPrice / totalShares) * 1000) / 1000;
  }
  getTotalGain(p:StockPosition){
    return (p.quote*this.getSum(p.transactions) - (this.getAvg(p.transactions) * this.getSum(p.transactions)))
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

  CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
      (
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
      var strMatchedDelimiter = arrMatches[1];
      if (
        strMatchedDelimiter.length &&
        (strMatchedDelimiter != strDelimiter)
      ) {
        arrData.push([]);
      }
      if (arrMatches[2]) {
        var strMatchedValue = arrMatches[2].replace(
          new RegExp("\"\"", "g"),
          "\""
        );
      } else {
        var strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
  }

}