import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType } from './shared/models/transaction';
import { FinanceService } from './shared/services/finance.service';
import { saveAs } from 'file-saver/FileSaver';
import { StockService } from './shared/services/stock.service';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { UtilService } from './shared/services/util.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() newTransaction: Transaction;
  @Input() importText: string;
  @Input() importJson: string;
  @Input() showAll: boolean;
  positions: StockPosition[];
  alive = true;
  sCol: string = 'name';
  sortDir: number = 1;
  firstLoad: boolean = true;

  constructor(private financeService: FinanceService, private stockService: StockService, private utilService: UtilService) {
    this.newTransaction = new Transaction("", "", null, null, null, false, null);
    this.InitPositions();

    IntervalObservable.create(3000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.alive && (document.visibilityState != "hidden")) {
          this.getCurrentPrice();
        }
        else {
          if (this.firstLoad) { this.getCurrentPrice(); this.firstLoad = false; }
        }
      });
  }
  private InitPositions() {
    this.stockService.GetNYSEStatus().subscribe(d => {
      this.alive = d.is_open && (new Date(d.closes_at).valueOf() > new Date().valueOf());
      (this.alive) ? console.log('Open') : console.log('Closed');
    })
    this.positions = this.financeService.getAllPositions();
    this.getCurrentPrice();
  }
  getCurrentPrice() {
    var syms = [];
    this.positions.forEach(e => syms.push(e.symbol));
    this.stockService.GetTradingAPI(syms).subscribe(data => {
      data.results.forEach(k => {
        this.positions.find(e => e.symbol === k.symbol).quote = k.last_extended_hours_trade_price || k.last_trade_price;
        this.positions.find(e => e.symbol === k.symbol).adj_prev_close = k.adjusted_previous_close;
      });
    });
  }
  sortData(sortingCol: string) {
    if (sortingCol === this.sCol) this.sortDir *= -1;
    if (sortingCol == 'name' || sortingCol == 'symbol') { this.positions.sort((a, b) => { return this.sortDir * a[sortingCol].localeCompare(b[sortingCol]); }) }
    else if (sortingCol == 'shares') { this.positions.sort((a, b) => { return this.sortDir * a.shares() - b.shares(); }) }
    else if (sortingCol == 'avgcost') { this.positions.sort((a, b) => { return this.sortDir * (a.avgPrice() - b.avgPrice()); }) }
    else if (sortingCol == 'daychange') {
      this.positions.sort((a, b) => { return this.sortDir * ((a.quote - a.adj_prev_close) - (b.quote - b.adj_prev_close)); })
    }
    else if (sortingCol == 'daychangeper') {
      this.positions.sort((a, b) => {
        return this.sortDir * ((((a.quote - a.adj_prev_close) / a.adj_prev_close) * 100) -
          ((b.quote - b.adj_prev_close) / b.adj_prev_close) * 100
        );
      })
    }
    else if (sortingCol == 'daygain') {
      this.positions.sort((a, b) => {
        return this.sortDir * ((a.quote - a.adj_prev_close) * (a.shares())
          - (b.quote - b.adj_prev_close) * (b.shares()))
      });
    }
    else if (sortingCol == 'mktval') {
      this.positions.sort((a, b) => {
        return this.sortDir * ((a.quote * a.shares()) -
          (b.quote * b.shares()));
      })
    }
    else if (sortingCol == 'avgcost') { this.positions.sort((a, b) => { return this.sortDir * (a.avgPrice() - b.avgPrice()); }) }
    else if (sortingCol == 'quote') { this.positions.sort((a, b) => { return this.sortDir * (a.quote - b.quote); }) }
    else if (sortingCol == 'totgain') {
      this.positions.sort((a, b) => {
        return this.sortDir * (a.unrealizedGainLoss() - b.unrealizedGainLoss());
      })
    }
    this.sCol = sortingCol;
  }
  removeAll() {
    this.positions = this.financeService.removeAllPositions().getAllPositions();
  }
  importTransactions() {
    var transactions = this.utilService.CSVToArray(this.importText, null);
    transactions.forEach(trans => {
      let currTrans: Transaction = new Transaction(trans[1], trans[0], new Date(trans[3]), TransactionType.BUY, <number>(trans[4]), false, <number>(trans[5]));
      this.addTrans(currTrans);
      this.positions = this.financeService.getAllPositions();
    });
  }
  openFile(event) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
      let reader = new FileReader();
      reader.onload = () => {
        this.importJsonTrans(reader.result);
      }
      reader.readAsText(input.files[index]);
    };
  }
  importJsonTrans(jsonText: string) {
    var transactions = JSON.parse(jsonText);
    transactions.forEach(trans => {
      this.addTrans(trans);
      this.positions = this.financeService.getAllPositions();
    });
    this.firstLoad = true;
  }
  addTransaction(trans: Transaction) {
    this.newTransaction.type = TransactionType.BUY;
    this.newTransaction.symbol = this.newTransaction.symbol.toUpperCase();
    this.positions = this.financeService.addTransction(trans).getAllPositions();
    this.firstLoad = true;
    this.newTransaction = new Transaction("", "", null, null, 0, false, 0);
  }
  addTrans(trans: Transaction) {
    this.positions = this.financeService.addTransction(trans).getAllPositions();
  }
  SaveAsFile() {
    var allTrans = [];
    this.financeService.getAllPositions().forEach(e => e.transactions.forEach(t => allTrans.push(t)));
    this.utilService.SaveAsFile(JSON.stringify(allTrans), "myportfolio.json");
  }

  getTitle(colName: string) {
    let retStr = "";
    if (colName == 'name') { retStr = "Name"; }
    else if (colName == 'symbol') { retStr = "Symbol"; }
    else if (colName == 'shares') { retStr = "Shares"; }
    else if (colName == 'avgcost') { retStr = "Avg.Cost"; }
    else if (colName == 'quote') { retStr = "Price"; }
    else if (colName == 'daychange') { retStr = "Day Change"; }
    else if (colName == 'daychangeper') { retStr = "Day Change %"; }
    else if (colName == 'daygain') { retStr = "Day Gain"; }
    else if (colName == 'mktval') { retStr = "Market Value"; }
    else if (colName == 'totgain') { retStr = "Gain/Loss"; }
    if (colName == this.sCol) {
      retStr += (this.sortDir == 1) ? "▲" : "▼";
    }
    return retStr;
  }
  validateSymbol() {
    this.newTransaction.name = "";
    this.newTransaction.symbol = this.newTransaction.symbol.toUpperCase();
    if (this.newTransaction.symbol.length > 0) {
      this.stockService.GetTradingAPI(new Array(this.newTransaction.symbol.toUpperCase())).subscribe(d => {
        if (d.results.length > 0) {
          this.stockService.GetSymbolName(d.results[0].instrument).subscribe(r => {
            this.newTransaction.name = r.simple_name;
          })
        }
        else { alert('Not a valid symbol'); }
      }, err => { alert('Not a valid symbol'); });
    }
  }
  //helper functions
  getGrandTotalGain() {
    var totSum: number = 0;
    this.positions.forEach(
      pos => (
        totSum += pos.unrealizedGainLoss())
    );
    return totSum;
  }
  getGrandTotal() {
    var totSum: number = 0;
    this.positions.forEach(
      pos => (
        totSum += pos.marketValue()
      )
    );
    return totSum;
  }
  getGrandTotalDayGain() {
    var totSum: number = 0;
    this.positions.forEach(
      pos => (
        totSum +=
        pos.marketValue() - pos.adj_prev_close * pos.shares()
      )
    );
    return totSum;
  }
}