import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import { Portfolio } from '../../models/entities';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { RobinhoodService } from '../../services/robinhood.service';

@Component({
  selector: 'app-portfolio-card',
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.css']
})
export class PortfolioCardComponent implements OnInit {
  @Input() portfolio: Portfolio;
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  totalValue: number = 0;
  constructor(private stockService: RobinhoodService) { }
  ngOnInit() {
    IntervalObservable.create(3000)// get our data every subsequent 10 seconds
      .subscribe(() => {
        if (this.portfolio.positions && this.portfolio.positions.length > 0 
                                     && (document.visibilityState != "hidden")) {
          this.loadLastTradedValue(this.portfolio);
        }
      });
  }
  deletePortfolio() {
    this.delete.emit(this.portfolio.id);
  }
  loadLastTradedValue(portfolio: Portfolio) {
    var syms = [];
    portfolio.positions.forEach(e => syms.push(e.symbol));

    console.log(syms);

    if (syms.length > 0) {
      this.stockService.GetStockQuotes(syms).subscribe(data => {
        data.results.forEach(k => {
          this.portfolio.positions.find(e => e.symbol === k.symbol).quote = k.last_trade_price;
          this.portfolio.positions.find(e => e.symbol === k.symbol).adj_prev_close = k.adjusted_previous_close;
        });
        this.totalValue = this.getGrandTotal(this.portfolio);
      }, e => { console.log('error occured in getting quotes'); });
    }
    else {
      console.log('no symbols');
    }

  }
  getGrandTotal(p: Portfolio) {
    var totSum: number = 0;
    p.positions.forEach(
      pos => (
        totSum += pos.marketValue()
      )
    );
    return totSum;
  }
  getGrandTotalGain() {
    var totSum: number = 0;
    this.portfolio.positions.forEach(
      pos => (
        totSum += pos.unrealizedGainLoss())
    );
    return totSum;
  }
  getGrandTotalGainPer() {
    var origCos = this.getGrandCostBasis();
    return ((this.getGrandTotal(this.portfolio) - origCos) / origCos) * 100;
  }
  getGrandCostBasis() {
    var totSum: number = 0;
    this.portfolio.positions.forEach(
      pos => (
        totSum += pos.totalCostBasis()
      )
    );
    return totSum;
  }
  getGrandTotalDayGain() {
    var totSum: number = 0;
    this.portfolio.positions.forEach(
      pos => (
        totSum +=
        pos.marketValue() - pos.adj_prev_close * pos.shares()
      )
    );
    return totSum;
  }
}
