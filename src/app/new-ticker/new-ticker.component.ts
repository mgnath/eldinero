import { Component, OnInit, EventEmitter, Output } from '@angular/core';
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
  stockName = '';
  transType = '0';
  @Output() add: EventEmitter<any> = new EventEmitter<any>();

  constructor(private stockService: StocksApiService) {
    this.newT = new Transaction('', null, TransactionType.BUY , null, false, null);
  }
  ngOnInit() {
  }
  onDate(event): void {
    this.newT.date = event;
    // this.getData(this.roomsFilter.date);
  }
  addTransaction(trans: Transaction) {
    this.newT.symbol = this.newT.symbol.toUpperCase();
    this.newT.date = new Date(this.newT.date);
    if (this.transType === '0') {
      this.newT.type = TransactionType.BUY;
    } else {
      this.newT.type = TransactionType.SELL;
    }
    this.add.emit( { trans: this.newT, symName: this.stockName } );

    this.newT = new Transaction( '', null, TransactionType.BUY , null, false, null);
    this.stockName = '';
  }
  validateSymbol() {
    this.newT.symbol = this.newT.symbol.toUpperCase();
    if (this.newT.symbol.length > 0) {
      this.stockService.validateSymbol(this.newT.symbol).subscribe(r => {
        this.stockName = r.name || '';
        console.log(r);
      });
    }
  }
}