import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType, Portfolio, quote } from '../shared/models/entities';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { UtilService } from '../shared/services/util.service';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { debounce } from 'rxjs/operator/debounce';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { StocksApiService, StockPrice } from '../shared/services/stocksapi.service';

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
  sCol: string = 'daygain';
  sortDir: number = -1;
  firstLoad: boolean = true;
  histArray: any[] = [];

  private sub: any;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private portfolioSrv: PortfolioService,
    private utilService: UtilService,
    private titleSrv: Title,
    private sapi:StocksApiService) {
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
      this.portfolioSrv.portfolios.pipe().map(portfolios => portfolios.find(p => p.id === this.id));
    this.currPortfolio$.subscribe(
      p => {
        this.currPortfolio = p;
        this.updateQuotes();
      }
    );


  }
  getTranType(typ:any){
    if(typ == 1){
      return "SELL";
    }
    else if(typ == 0){
      return "BUY";
    }
    else{return "tbd"};
  }
  getTtl() {
    this.titleSrv.setTitle('El Dinero>' + this.currPortfolio.getGrandTotalDayGain().toFixed(2).toString());
    return this.currPortfolio.getGrandTotalDayGain();
  }
  updateQuotes() {
    var syms = [];
    this.currPortfolio.positions.forEach(e => syms.push(e.symbol));
    this.quotes$ = this.sapi.getLatestPrice(syms);// this.robinhoodRxSrv.getQuotes(syms);
    this.quotes$.subscribe(
      q => {
        //console.log(q);
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
        this.sortData(this.sCol,true);
      });
  }
  handleAddTrans(newTrans: Transaction) {
    this.portfolioSrv.addTransction(newTrans, this.id);
  }
  getTitle(colName: string) {
    let retStr = "";
    if (colName == 'name') { retStr = "Name"; }
    else if (colName == 'symbol') { retStr = "Symbol"; }
    else if (colName == 'shares') { retStr = "Shares"; }
    else if (colName == 'avgcost') { retStr = "Avg.Cost"; }
    else if (colName == 'quote') { retStr = "Price"; }
    else if (colName == 'daychange') { retStr = "Day Change"; }
    else if (colName == 'daychangeper') { retStr = "Day Change %"; }
    else if (colName == 'daygain') { retStr = "Day Gain"; }
    else if (colName == 'mktval') { retStr = "Market Value"; }
    else if (colName == 'totgain') { retStr = "Gain/Loss"; }
    if (colName == this.sCol) { retStr += (this.sortDir == 1) ? "▲" : "▼"; }
    return retStr;
  }
  sortData(sortingCol: string, refreshCall:boolean = false) {
    if (sortingCol === this.sCol && !refreshCall) this.sortDir *= -1;
    if (sortingCol == 'name' || sortingCol == 'symbol') { this.currPortfolio.positions.sort((a, b) => { return this.sortDir * a[sortingCol].localeCompare(b[sortingCol]); }) }
    else if (sortingCol == 'shares') { this.currPortfolio.positions.sort((a, b) => { return this.sortDir * (a.shares - b.shares) }) }
    else if (sortingCol == 'avgcost') { this.currPortfolio.positions.sort((a, b) => { return this.sortDir * (a.avgPrice - b.avgPrice) }) }
    else if (sortingCol == 'daychange') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir *
          (a.dayChange - b.dayChange);
      })
    }
    else if (sortingCol == 'daychangeper') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.dayChangePer - b.dayChangePer);
      })
    }
    else if (sortingCol == 'daygain') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.dayGain - b.dayGain)
      });
    }
    else if (sortingCol == 'mktval') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.marketValue() - b.marketValue());
      })
    }
    else if (sortingCol == 'avgcost') { this.currPortfolio.positions.sort((a, b) => { return this.sortDir * (a.avgPrice - b.avgPrice); }) }
    else if (sortingCol == 'quote') {
      this.currPortfolio.positions.sort((a, b) => { return this.sortDir * (a.latestQuote.last_trade_price - b.latestQuote.last_trade_price); })
    }
    else if (sortingCol == 'totgain') {
      this.currPortfolio.positions.sort((a, b) => {
        return this.sortDir * (a.unrealizedGainLoss() - b.unrealizedGainLoss());
      })
    }
    this.sCol = sortingCol;
  }

}