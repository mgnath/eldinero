import { Component, OnInit,EventEmitter } from '@angular/core';
import {MatFormFieldModule} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import { Transaction, TransactionType, StockPosition } from '../shared/models/transaction';
import { FinanceService } from '../shared/services/finance.service';
import { RobinhoodService } from '../shared/services/robinhood.service';

@Component({
  selector: 'ed-new-ticker',
  templateUrl: './new-ticker.component.html',
  styleUrls: ['./new-ticker.component.css']
})
export class NewTickerComponent implements OnInit {
  newTransaction: Transaction;
  add: EventEmitter<Transaction> = new EventEmitter<Transaction>();
  
  constructor(private financeService: FinanceService, private stockService:RobinhoodService ){
    this.newTransaction = new Transaction("", "", null, null, null, false, null);
  }
  ngOnInit() {
  }
  addTransaction(trans: Transaction) {
    this.newTransaction.type = TransactionType.BUY;
    this.newTransaction.symbol = this.newTransaction.symbol.toUpperCase();
    this.financeService.addTransction(trans).getAllPositions();
    this.newTransaction = new Transaction("", "", null, null, 0, false, 0);
    this.add.emit(this.newTransaction);
  }
  validateSymbol() {
    this.newTransaction.name = "";
    this.newTransaction.symbol = this.newTransaction.symbol.toUpperCase();
    if (this.newTransaction.symbol.length > 0) {
      this.stockService.GetStockQuotes(new Array(this.newTransaction.symbol.toUpperCase())).subscribe(d => {
        if (d.results.length > 0) {
          this.stockService.GetSymbolName(d.results[0].instrument).subscribe(r => {
            this.newTransaction.name = r.simple_name;
          })
        }
        else { alert('Not a valid symbol'); }
      }, err => { alert('Not a valid symbol'); });
    }
  }
}
