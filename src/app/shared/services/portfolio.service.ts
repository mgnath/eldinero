import { Injectable } from '@angular/core';
import { Portfolio } from '../models/entities';
import { Portal } from '@angular/cdk/portal';
import { UtilService } from './util.service';

@Injectable()
export class PortfolioService {
  portfolios: Portfolio[];
  constructor() { }
  getAllPortfolios(): Portfolio[] { return this.portfolios; }
  loadData(){
    this.portfolios =  new Array<Portfolio>();
    var jsonObj:Portfolio[] = JSON.parse(localStorage.getItem("eldinero.v1")) as Portfolio[] || [];
    jsonObj.forEach(e=>{
      this.portfolios.push(Object.assign(new Portfolio(), e));
    });
  }
  addPortfolio(name:string){
    let newPortfolio = new Portfolio();
    newPortfolio.name = name;
    newPortfolio.id = UtilService.generateGUID();
    newPortfolio.version = "1.0.0";
    this.portfolios = this.portfolios || new Array<Portfolio>();
    this.portfolios.push(newPortfolio);
  }
  removeAllPositions() {
    this.portfolios = [];
    localStorage.clear();
    return this;
  }
}
