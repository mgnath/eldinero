import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Transaction } from './shared/models/transaction';
import { FinanceService } from './shared/services/finance.service';
import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() newTransaction: Transaction;
  @Input() symbol: string;
  @Input() rawData: string;
  positions: Map<string, Transaction[]>;
  constructor(private financeService: FinanceService) {
    this.newTransaction = new Transaction("", "", null, null, null, false, null);
    this.InitPositions();
  }
  private InitPositions() {
    this.positions = this.financeService.getAllPositions();
  }
  addTransaction() {
    this.positions = this.financeService.addTransction(this.newTransaction).getAllPositions();
    this.newTransaction = new Transaction("", "", null, null, 0, false, 0);
  }
  removeAll() {
    this.positions = this.financeService.removeAllPositions().getAllPositions();
  }
  getSum(trans: Transaction[]) {
    var sum = trans.reduce(function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return sum;
  }
  getAvg(trans: Transaction[]) {
    var totalPrice = trans.reduce(function (p, c, i) {
      return Number(p) +
        (Number(c.price) * Number(c.shares))
    }, 0);
    var totalShares = trans.reduce(
      function (p, c, i) { return Number(p) + Number(c.shares) }, 0);
    return Math.round((totalPrice / totalShares) * 1000) / 1000;
  }
  SaveAsFile(){
    var text = JSON.stringify(this.financeService.getAllPositions());
    var filename = "myportfolio";
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename+".txt");
  } 
}