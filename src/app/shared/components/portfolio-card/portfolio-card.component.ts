import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Portfolio } from '../../models/entities';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { StocksApiService } from '../../services/stocksapi.service';

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


  constructor(private stockService: StocksApiService) { }
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
      this.stockService.getLatestPrice(syms).subscribe(data => {
        //console.log("new data")
        data.forEach(k => {
          if (this.portfolio.positions.find(e => e.symbol === k.sym)) {
            this.loading = false;
            this.portfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.last_trade_price = k.price;
            this.portfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.updated_at = k.t;
            this.portfolio.positions
            .find(e => e.symbol === k.sym).latestQuote.adjusted_previous_close = k.prev_close;

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
