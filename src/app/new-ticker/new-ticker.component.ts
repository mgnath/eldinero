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
    this.newT = new Transaction('', '', null, 0 , null, false, null);
  }
  ngOnInit() {
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

     /*  this.stockService.checkSymbols(new Array(this.newT.symbol.toUpperCase()))
      .subscribe(syms=> {
        let res = syms.filter(s=>s.sym == this.newT.symbol)
        if(res)
          this.newT.name = res[0].name || "";
      }); */

    }
  }
}


/* this.stockService.GetStockQuotes(new Array(this.newT.symbol.toUpperCase())).subscribe(quotes => {
  if (quotes.length > 0) {
    this.stockService.getSymbolName(quotes[0].instrument).subscribe(r => {
      this.newT.name = r.simple_name;
    })
  }
  else { alert('Not a valid symbol'); }
}, err => { alert('Not a valid symbol'); }); */
