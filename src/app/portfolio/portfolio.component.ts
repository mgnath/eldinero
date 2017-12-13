import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Transaction, StockPosition, TransactionType, Portfolio, quote } from '../shared/models/entities';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { UtilService } from '../shared/services/util.service';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
import { debounce } from 'rxjs/operator/debounce';
import { Router, ActivatedRoute } from '@angular/router';
import { RobinhoodRxService } from '../shared/services/robinhood-rx.service';
import { Title } from '@angular/platform-browser';
import { AlphavantageService } from '../shared/services/alphavantage.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  currPortfolio: Portfolio;
  currPortfolio$: Observable<Portfolio>;
  quotes$: Observable<quote[]>;
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
    private robinhoodRxSrv: RobinhoodRxService,
    private alphSrv: AlphavantageService,
    private utilService: UtilService,
    private titleSrv: Title) {
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
  getTtl() {
    this.titleSrv.setTitle('El Dinero>' + this.currPortfolio.getGrandTotalDayGain().toFixed(2).toString());
    return this.currPortfolio.getGrandTotalDayGain();
  }
  updateQuotes() {
    var syms = [];
    this.currPortfolio.positions.forEach(e => syms.push(e.symbol));
    this.quotes$ = this.robinhoodRxSrv.getQuotes(syms);
    this.quotes$.subscribe(
      q => {
        q.forEach(k => {
          if (this.currPortfolio.positions.find(e => e.symbol === k.symbol)) {
            this.currPortfolio.positions.find(e => e.symbol === k.symbol).latestQuote = k;
          }
        });
      });
  }
  historicalData() {
    this.currPortfolio.positions.forEach(pos => {
      this.alphSrv.getHistoricalData(pos.symbol.replace('.', '-'))
        .subscribe(d => {
          try {
            let temp: any = {};
            temp.symbol = pos.symbol;

            Object.keys(d["Time Series (Daily)"]).forEach(
              key => {
                  var results = this.histArray.find(e=> e.tradeDate ===  key);
                  if(results){
                    results.dailyTot += d["Time Series (Daily)"][key]["4. close"]* pos.shares;
                  }
                  else{
                    this.histArray.push({ tradeDate : key, dailyTot: d["Time Series (Daily)"][key]["4. close"]* pos.shares});
                  }
                }
            );
            //console.log(this.histArray);
          } catch (ex) { console.log('error in' + ex); }
        });
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
  sortData(sortingCol: string) {
    if (sortingCol === this.sCol) this.sortDir *= -1;
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