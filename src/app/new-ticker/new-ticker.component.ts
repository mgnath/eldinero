import { Component, OnInit,EventEmitter } from '@angular/core';
import {MatFormFieldModule} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import { Transaction, TransactionType, StockPosition } from '../shared/models/entities';
import { FinanceService } from '../shared/services/finance.service';
import { RobinhoodService } from '../shared/services/robinhood.service';

@Component({
  selector: 'ed-new-ticker',
  templateUrl: './new-ticker.component.html',
  styleUrls: ['./new-ticker.component.css']
})
export class NewTickerComponent implements OnInit {
  newT: Transaction;
  add: EventEmitter<Transaction> = new EventEmitter<Transaction>();
  
  constructor(private financeService: FinanceService, private stockService:RobinhoodService ){
    this.newT = new Transaction("", "", null, null, null, false, null);
  }
  ngOnInit() {
  }
  addTransaction(trans: Transaction) {
    this.newT.type = TransactionType.BUY;
    this.newT.symbol = this.newT.symbol.toUpperCase();
    this.financeService.addTransction(trans).getAllPositions();
    this.newT = new Transaction("", "", null, null, 0, false, 0);
    this.add.emit(this.newT);
  }
  validateSymbol() {
    this.newT.name = "";
    this.newT.symbol = this.newT.symbol.toUpperCase();
    if (this.newT.symbol.length > 0) {
      this.stockService.GetStockQuotes(new Array(this.newT.symbol.toUpperCase())).subscribe(d => {
        if (d.results.length > 0) {
          this.stockService.GetSymbolName(d.results[0].instrument).subscribe(r => {
            this.newT.name = r.simple_name;
          })
        }
        else { alert('Not a valid symbol'); }
      }, err => { alert('Not a valid symbol'); });
    }
  }
}
