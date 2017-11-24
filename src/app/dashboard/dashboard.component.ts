import { Component, OnInit } from '@angular/core';
import { Portfolio } from '../shared/models/entities';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  portfolios:Observable<Portfolio[]>;
  newPortfolioName:string="";
  constructor(private portfolioSrv:PortfolioService) {
  }
  ngOnInit() {
    this.InitPositions();
  }
  InitPositions() {
    this.portfolios = this.portfolioSrv.portfolios;
  }
  createNewPortfolio(name:string){
    this.portfolioSrv.addPortfolio(name);
    this.newPortfolioName = "";
  }
  DeletePortfolio(id: string) {
    this.portfolioSrv.removePosition(id);
  }
}
