import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType, Portfolio, quote } from '../shared/models/entities';
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
import { RobinhoodRxService } from '../shared/services/robinhood-rx.service';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})//http://localhost:4200/portfolio/20d64349-3d39-4f04-c752-2156e8b67f56
export class PortfolioComponent {
  currPortfolio:Portfolio;
  currPortfolio$:Observable<Portfolio>;
  quotes$:Observable<quote[]>;
  id:string;
  private sub: any;
  constructor(private route: ActivatedRoute,
              private portfolioSrv:PortfolioService,
              private robinhoodRxSrv:RobinhoodRxService) {
  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.id = params['id'];
       this.InitPositions();
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
   // this.currPortfolio$.unsubscribe();  tbd

  }
  private InitPositions() {
    this.currPortfolio$ =
        this.portfolioSrv.portfolios.pipe().map(portfolios => portfolios.find(p => p.id ===  this.id));
    this.currPortfolio$.subscribe(
      p=>{
        this.currPortfolio=p;
        this.updateQuotes();
      }
    );
  }
  updateQuotes(){
    var syms = [];
    this.currPortfolio.positions.forEach(e => syms.push(e.symbol));
    this.quotes$ = this.robinhoodRxSrv.getQuotes(syms);
    this.quotes$.subscribe(
      q=>{
        q.forEach(k => {
          if(this.currPortfolio.positions.find(e => e.symbol === k.symbol)){
            this.currPortfolio.positions.find(e => e.symbol === k.symbol).latestQuote = k;
          }
        });
      });
  }
  handleAddTrans(newTrans: Transaction) {
    this.portfolioSrv.addTransction(newTrans,this.id);
  }
}