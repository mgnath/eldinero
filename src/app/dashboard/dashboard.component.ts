import { Component, OnInit } from '@angular/core';
import { Portfolio } from '../shared/models/entities';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs';
import { StocksApiService } from '../shared/services/stocksapi.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  portfolios: Observable<Portfolio[]>;
  newPortfolioName = '';
  constructor(private portfolioSrv: PortfolioService, private sapi: StocksApiService) {
  }
  ngOnInit() {
    this.InitPositions();
  }
  InitPositions() {
    this.portfolios = this.portfolioSrv.portfolios;
  }
  createNewPortfolio(name: string) {
    this.portfolioSrv.addPortfolio(name);
    this.newPortfolioName = '';
  }
  DeletePortfolio(id: string) {
    if ( confirm('Are you sure to delete') ){
      this.portfolioSrv.removePosition(id);
    }
  }
}
