import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType, Portfolio } from '../shared/models/entities';
import { FinanceService } from '../shared/services/finance.service';
import { saveAs } from 'file-saver/FileSaver';
import { RobinhoodService } from '../shared/services/robinhood.service';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { UtilService } from '../shared/services/util.service';
import * as $ from 'jquery';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  currPortfolio:Portfolio;
  currPortfolio$:Observable<Portfolio>;
  id:string;
  private sub: any;
  constructor(private route: ActivatedRoute,
              private portfolioSrv:PortfolioService) {
  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.id = params['id'];
       this.InitPositions();
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  private InitPositions() {
    console.log(this.id);
    this.currPortfolio$ =
        this.portfolioSrv.portfolios.pipe().map(portfolios => portfolios.find(p => p.id ===  this.id));
    this.currPortfolio$.subscribe(d=>this.currPortfolio=d);
  }
  handleAddTrans(newTrans: Transaction) {
    console.log(newTrans);
    this.portfolioSrv.addTransction(newTrans,this.id);
  }
}