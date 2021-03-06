/* tslint:disable */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType, Portfolio, quote } from '../shared/models/entities';
import { UtilService } from '../shared/services/util.service';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { StocksApiService, StockPrice } from '../shared/services/stocksapi.service';
import { IexService } from '../shared/services/iex.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  currPortfolio: Portfolio;
  currPortfolio$: Observable<Portfolio>;
  quotes$: Observable<StockPrice[]>;
  id: string;
  alive = true;
  sCol = 'daygain';
  sortDir = -1;
  firstLoad = true;
  histArray: any[] = [];
  showAll = false;

  private sub: any;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private portfolioSrv: PortfolioService,
    private utilService: UtilService,
    private titleSrv: Title,
    private sapi: StocksApiService,
    private iexSrv:IexService) {
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
    console.log('initializing port comp');
    this.currPortfolio$ =
      this.portfolioSrv.portfolios.pipe(map(portfolios => portfolios.find(p => p.id === this.id)));
    this.currPortfolio$.subscribe(
      p => {
        this.currPortfolio = p;
        this.updateQuotes();
      }
    );
  }
  getCurrentPositions(positions: StockPosition[]){
    return positions.filter(pos=> pos.shares>0);
  }
  getTranType(typ:any){
    if(typ === 1){
      return 'SELL';
    } else if( typ === 0) {
      return 'BUY';
    } else{return 'tbd'; }
  }
  getTtl() {
    this.titleSrv.setTitle('El Dinero>' + this.currPortfolio.getGrandTotalDayGain().toFixed(2).toString());
    return this.currPortfolio.getGrandTotalDayGain();
  }
 /*  updateTotalDividends(){
    this.currPortfolio.positions.forEach(p=>{
      this.currPortfolio.positions.find(e => e.symbol === p.symbol).latestQuote this.portfolioSrv.stockEquityInTransactionsAt(new Date(),p.transactions)
      }
    )
  } */
  async calculateDividendEarned(pos:StockPosition):Promise<number>{
    const divs:any[] = await this.iexSrv.getAdjustedDividends(pos.symbol);
    const first:Date = pos.transactions.sort((a, b)=>{return new Date(a.date).valueOf() - new Date(b.date).valueOf()})[0].date;
    const filteredDivs = divs.filter(div=>div.exDate >= first);
    let divTot = 0;
    filteredDivs.reverse().forEach(div=>{ 
      divTot +=  (this.portfolioSrv.stockEquityInTransactionsAt(new Date(div.exDate), pos.transactions) * div.amount); 
       });
    return divTot | 0;
  }
  updateQuotes() {
    let syms = [];
    if (!this.currPortfolio) { return; }
    this.currPortfolio.positions.forEach(e => syms.push(e.symbol));
    this.quotes$ = this.sapi.getLatestPrice(syms);

    this.currPortfolio.positions.forEach(async pos => 
       pos.totDivEarned = await this.calculateDividendEarned(pos));
   
    this.quotes$.subscribe(
      q => {
        q.forEach(k => {
          if (this.currPortfolio.positions.find(e => e.symbol === k.sym)) {
            this.currPortfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.last_trade_price = k.price;
            this.currPortfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.updated_at = k.t;
            this.currPortfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.adjusted_previous_close = k.prev_close;
          }
        });
        this.sortData(this.sCol, true);
      });
  }
  handleAddTrans(newTrans: any) {
    this.portfolioSrv.addTransction(newTrans.trans, this.id, newTrans.symName );
  }
  getTitle(colName: string) {
    let retStr = '';
    if (colName === 'name') { retStr = 'Name'; }
    else if (colName === 'symbol') { retStr = 'Symbol'; }
    else if (colName === 'div') { retStr = 'Dividend'; }
    else if (colName === 'shares') { retStr = 'Shares'; }
    else if (colName === 'avgcost') { retStr = 'Avg.Cost'; }
    else if (colName === 'quote') { retStr = 'Price'; }
    else if (colName === 'daychange') { retStr = 'Day Change'; }
    else if (colName === 'daychangeper') { retStr = 'Day Change %'; }
    else if (colName === 'daygain') { retStr = 'Day Gain'; } else if (colName === 'mktval') { retStr = 'Market Value'; }
    else if (colName === 'costbasis') { retStr = 'Cost Basis'; }
    else if (colName === 'totgain') { retStr = 'Gain/Loss'; }
    if (colName === this.sCol) { retStr += (this.sortDir === 1) ? '▲' : '▼'; }
    return retStr;
  }
  sortData(sortingCol: string, refreshCall:boolean = false) {
    if (sortingCol === this.sCol && !refreshCall) { this.sortDir *= -1; }
    if (sortingCol === 'name' || sortingCol === 'symbol') {
      this.currPortfolio.positions.sort((a, b) => this.sortDir * a[sortingCol].localeCompare(b[sortingCol]));
    }
    else if (sortingCol === 'shares') {
      this.currPortfolio.positions.sort((a, b) => this.sortDir * (a.shares - b.shares));
    } else if (sortingCol === 'avgcost') {
    this.currPortfolio.positions.sort((a, b) => this.sortDir * (a.avgPrice - b.avgPrice)); }
    else if (sortingCol === 'div') {
      this.currPortfolio.positions.sort((a, b) => this.sortDir * ( (a.totDivEarned | 0) - (b.totDivEarned | 0) )); }
    else if (sortingCol === 'daychange') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir *
          (a.dayChange - b.dayChange);
      });
    } else if (sortingCol === 'daychangeper') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.dayChangePer - b.dayChangePer);
      });
    } else if (sortingCol === 'daygain') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.dayGain - b.dayGain);
      });
    } else if (sortingCol === 'mktval') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.marketValue() - b.marketValue());
      });
    } else if (sortingCol === 'costbasis') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.totalCostBasis() - b.totalCostBasis());
      });
    } else if (sortingCol === 'avgcost') {
      this.currPortfolio.positions.sort((a, b) => this.sortDir * (a.avgPrice - b.avgPrice));
    } else if (sortingCol === 'quote') {
      this.currPortfolio.positions.sort((a, b) => this.sortDir * (a.latestQuote.last_trade_price - b.latestQuote.last_trade_price));
    } else if (sortingCol === 'totgain') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.unrealizedGainLoss() - b.unrealizedGainLoss());
      });
    }
    this.sCol = sortingCol;
  }

}
