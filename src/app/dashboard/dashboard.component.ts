import { Component, OnInit } from '@angular/core';
import { Portfolio } from '../shared/models/entities';
import { PortfolioService } from '../shared/services/portfolio.service';
import { Observable } from 'rxjs/Observable';
import { StocksApiService } from '../shared/services/stocksapi.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  portfolios:Observable<Portfolio[]>;
  newPortfolioName:string="";
  constructor(private portfolioSrv:PortfolioService,private sapi:StocksApiService) {
  }
  ngOnInit() {
    this.InitPositions();
    this.sapi.getLatestPrice(['AAPL','MSFT','IBM','RAD','FB','AMZN','TECK','C','P','T']).subscribe(r=>{ });
    //this.sapi.getHistory('AAPL',new Date(),new Date()).subscribe(r=>{console.log(r.filter( sp=> sp.sym=='AMZN' ))})
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
