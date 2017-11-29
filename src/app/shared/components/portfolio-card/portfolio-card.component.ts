import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Portfolio } from '../../models/entities';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { RobinhoodRxService } from '../../services/robinhood-rx.service';

@Component({
  selector: 'app-portfolio-card',
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.css']
})
export class PortfolioCardComponent implements OnInit {
  @Input() portfolio: Portfolio;
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  totalValue: number = 0;
  loading: boolean = true;
  constructor(private stockService: RobinhoodRxService) { }
  ngOnInit() {
    this.loadLastTradedValues(this.portfolio);
  }
  deletePortfolio() {
    this.delete.emit(this.portfolio.id);
  }
  loadLastTradedValues(portfolio: Portfolio) {
    var syms = [];
    portfolio.positions.forEach(e => syms.push(e.symbol));
    if (syms.length > 0) {
      this.stockService.getQuotes(syms).subscribe(data => {
        data.forEach(k => {
          if (this.portfolio.positions.find(e => e.symbol === k.symbol)) {
            this.loading = false;
            this.portfolio.positions.find(e => e.symbol === k.symbol).latestQuote = k;
          }
        });

        this.totalValue = this.portfolio.getGrandTotal();
      }, e => { console.log('error occured in getting quotes'); });
    }
    else {
      console.log('no symbols');
    }

  }
}
