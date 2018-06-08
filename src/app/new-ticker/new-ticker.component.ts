import { Component, OnInit,EventEmitter, Output } from '@angular/core';
import {MatFormFieldModule} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import { Transaction, TransactionType, StockPosition } from '../shared/models/entities';
import { StocksApiService } from '../shared/services/stocksapi.service';

@Component({
  selector: 'ed-new-ticker',
  templateUrl: './new-ticker.component.html',
  styleUrls: ['./new-ticker.component.css']
})
export class NewTickerComponent implements OnInit {
  newT: Transaction;
  @Output() add: EventEmitter<Transaction> = new EventEmitter<Transaction>();

  constructor(private stockService: StocksApiService) {
    this.newT = new Transaction('', '', null, TransactionType.BUY , null, false, null);
  }
  ngOnInit() {
  }
  setCurrentTime() {
    this.newT.date = new Date(
    (new Date().getMonth() + 1) + '/'
    + new Date().getDay() + '/' + new Date().getFullYear() + ' '
    + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds());
  }
  addTransaction(trans: Transaction) {
    this.newT.symbol = this.newT.symbol.toUpperCase();
    this.newT.date = new Date(this.newT.date);
    this.add.emit(this.newT);
    this.newT = new Transaction('', '', null, 0, 0, false, 0);
  }
  validateSymbol() {
    this.newT.name = '';
    this.newT.symbol = this.newT.symbol.toUpperCase();
    if (this.newT.symbol.length > 0) {
      this.stockService.validateSymbol(this.newT.symbol).subscribe(r => {
        this.newT.name = r.name || '';
        console.log(r);
      });
    }
  }
}