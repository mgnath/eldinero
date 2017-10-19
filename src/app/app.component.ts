import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Transaction } from './shared/models/transaction';
import { FinanceService } from './shared/services/finance.service';
import { escape } from 'querystring';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() newTransaction:Transaction;
  @Input() symbol:string;
  @Input() rawData:string;
  transactions:Transaction[];
  constructor(private financeService: FinanceService) {
      this.newTransaction = new Transaction("","",null,null,0,false,0);
      this.InitPositions();
  }
  private InitPositions() {
      this.transactions = this.financeService.getAllPositions();
  }
  addTransaction(){
    this.transactions = this.financeService.addTransction(this.newTransaction).getAllPositions();
    this.newTransaction = new Transaction("","",null,null,0,false,0);
  }
  removeAll(){
    this.transactions = this.financeService.removeAllPositions().getAllPositions();
  }
}
