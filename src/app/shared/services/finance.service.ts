import { Injectable } from '@angular/core';
import { Transaction,TransactionType } from '../models/transaction';
import { UtilService } from './util.service';

@Injectable()
export class FinanceService {
  positions:Map<string,Transaction[]>;
  constructor(private util:UtilService) { 
    this.positions = JSON.parse(localStorage.getItem("eldinero")) 
                  || new Map<string,Transaction[]>();
  }
  importPositions(positions:Map<string,Transaction[]>){
    this.positions = positions;
  }
  getAllPositions():Map<string,Transaction[]>{return this.positions}
  removeAllPositions(){
    this.positions=new Map<string,Transaction[]>();
    localStorage.clear(); 
    return this;
  }
  addTransction(t:Transaction){
    t.id = this.util.generateGUID();
    if(this.positions[t.symbol])
    {
      this.positions[t.symbol].push(t);
    }
    else{
      var trans:Transaction[] =[];
      trans.push(t);
      this.positions[t.symbol]=trans;
    }
    localStorage.setItem("eldinero",JSON.stringify(this.positions));
    return this;
  }
}
