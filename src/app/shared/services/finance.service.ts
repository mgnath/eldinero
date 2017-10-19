import { Injectable } from '@angular/core';
import { Transaction,TransactionType } from '../models/transaction';
import { UtilService } from './util.service';

@Injectable()
export class FinanceService {
  positions:Transaction[];

  constructor(private util:UtilService) { 
    this.positions = JSON.parse(localStorage.getItem("eldinero")) || [];
  }
  importPositions(positions:Transaction[]){
    this.positions = positions;
  }
  getAllPositions():Transaction[]{return this.positions}
  removeAllPositions(){this.positions=[]; localStorage.clear(); return this;}
  addTransction(transaction:Transaction){
    transaction.id = this.util.generateGUID();
    this.positions.push(transaction);
    localStorage.setItem("eldinero",JSON.stringify(this.positions));
    return this;
  }
}
