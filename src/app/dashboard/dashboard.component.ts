import { Component, OnInit } from '@angular/core';
import { Portfolio } from '../shared/models/entities';
import { PortfolioService } from '../shared/services/portfolio.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  portfolios:Portfolio[];
  constructor(private portfolioSrv:PortfolioService) {
  }
  ngOnInit() {
    this.InitPositions();
  }
  InitPositions() {
    this.portfolios = this.portfolioSrv.getAllPortfolios();
  }
}
