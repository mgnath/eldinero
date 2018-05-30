import { Component, OnInit, Input } from '@angular/core';
import { Portfolio, Transaction, TransactionType } from '../shared/models/entities';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { StocksApiService } from '../shared/services/stocksapi.service';
import { Observable, interval, pipe } from 'rxjs/';
import * as moment from 'moment';

@Component({
  selector: 'app-hist-chart',
  templateUrl: './hist-chart.component.html',
  styleUrls: ['./hist-chart.component.css']
})
export class HistChartComponent implements OnInit {

  constructor(private alphSrv: AlphavantageService, private sapi: StocksApiService) {

  }

  @Input() currPortfolio: Portfolio;

  histArray: any[] = [];
  intraDayArray: any[] = [];
  graphDuration = 7;


  ngOnInit() {
    this.historicalData();
    this.dailyChart();
    interval(60001).subscribe( () => { this.dailyChart(); } );

  }
  // tslint:disable-next-line:member-ordering
  public lineChartDataGL: Array<any> = [
    { data: [], label: 'Gain Loss' }
  ];
  // tslint:disable-next-line:member-ordering
  public lineChartLabelsGL: Array<any> = [];

  public lineChartDataDaily: Array<any> = 
  [{ data: [], label: 'Intra Day Value' }];
  public lineChartLabelsDaily: Array<any> = [];

  public lineChartOptionsDaily: any = {
    responsive: true
  };
  public lineChartLegendDaily: boolean = true;
  public lineChartTypeDaily: string = 'line';
  // tslint:disable-next-line:member-ordering
  public lineChartColorsDaily: Array<any> = [
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];


  dailyChart() {
    this.intraDayArray = [];
    const gap = 5;
    const gapms = gap * 60000;
    const startTime = moment().startOf('day').add(9.501, 'hours');//subtract(24,'hours');//
    let temStart = startTime.clone();
    const endTime = moment().startOf('day').add(16.001, 'hours');
    while (temStart <= endTime) {
      this.intraDayArray.push({ time: temStart.toDate(), intrdayTot: 0, poscount: 0 });
      temStart = temStart.add(gap, 'm');
    }
    this.currPortfolio.positions.forEach((tran, idx) => {
    // let newsps = this.sapi.getHistoryInterval(tran.symbol, startTime.toDate(), endTime.toDate(), 1);
    //console.log(newsps);
      let sps = this.sapi.getHistory(tran.symbol, startTime.toDate(), endTime.toDate(), 1);
      this.intraDayArray.forEach(i => {
        let intSps = sps.filter(sp => {
          return new Date(sp.t).valueOf() >= i.time.valueOf()
            && new Date(sp.t).valueOf() < (i.time.valueOf() + gapms)
        });

        if (intSps && intSps.length > 0) {
          i.intrdayTot += intSps[intSps.length - 1].price * tran.shares;
          i.poscount++;
        }
      });
    });
    this.lineChartDataDaily[0].data = this.intraDayArray
      .filter(e => { return e.poscount == this.currPortfolio.positions.length })
      .map(e => e.intrdayTot.toFixed(2));

    this.lineChartLabelsDaily = this.intraDayArray
      .filter(e => e.poscount == this.currPortfolio.positions.length)
      .map(e => moment(e.time).format('h:mm:ss a'));

  }

  historicalData() {
    this.histArray = [];

    let trans: Array<Transaction> = new Array<Transaction>();
    this.currPortfolio.positions.map(pos => pos.transactions).forEach(
      t => { t.forEach(e => trans.push(e)) }
    );

    trans.forEach((tran, idx) => {
      //console.log(tran.date+","+tran.symbol+","+tran.shares+","+tran.price+","+tran.type);
      var sinceLastRef = this.alphSrv.sinceLastRefreshedHist(tran.symbol.replace('.', '-'));
      var interval = (sinceLastRef > 0 && sinceLastRef < 86400000) ? 50 : 2000;
      setTimeout(() => {
        this.alphSrv.getHistoricalData(tran.symbol.replace('.', '-'), 'TIME_SERIES_DAILY_ADJUSTED')
          .subscribe(d => {
            try {
              if (!(d["isCache"] && d["isCache"] == true)) {
                d["Meta Data"]["3. Last Refreshed"] = new Date();
              }
              localStorage.setItem(tran.symbol.replace('.', '-') + '_Hist', JSON.stringify(d));
              let timeKey: string = "Time Series (Daily)";// "Monthly Time Series";
              // let timeKey: string = "Monthly Adjusted Time Series";
              const closeKey = "4. close";
              Object.keys(d[timeKey]).forEach(
                key => {
                  let results = this.histArray.find(e => e.tradeKey === key);
                  if (!results && key != '2017-08-29') {
                    this.histArray.push({ tradeKey: key, tradeDate: new Date(key), dailyGL: 0, dailyTot: 0, costBasis: 0 });
                  }
                });
              Object.keys(d[timeKey]).forEach(
                key => {
                  let results = this.histArray.find(e => e.tradeKey === key);
                  if (results && key != '2017-08-29') {
                    if (new Date(key).valueOf() > (new Date(tran.date).valueOf() - 86400000)) {
                      if (tran.type == TransactionType.BUY) {
                        results.dailyTot += d[timeKey][key][closeKey] * tran.shares;
                        results.costBasis += tran.price * tran.shares;
                      }
                      else {
                        results.dailyTot -= d[timeKey][key][closeKey] * tran.shares;
                        results.costBasis -= tran.price * tran.shares;
                      }
                    }
                  }
                }
              );

              this.lineChartData[0].data = this.histArray.map(e => e.dailyTot.toFixed(2)).reverse();// .slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartData[1].data = this.histArray.map(e => e.costBasis.toFixed(2)).reverse();// .slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartLabels = this.histArray.map(e => e.tradeKey).reverse();// .slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));

              this.lineChartDataGL[0].data = this.histArray.map(e => (e.dailyTot - e.costBasis).toFixed(2)).reverse();// .slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartLabelsGL = this.histArray.map(e => e.tradeKey).reverse();// .slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));

            } catch (ex) { console.log('error in' + ex); }
          }, err => { console.log(err); });
      }, (idx + 1) * interval);
    });
  }
  public lineChartData: Array<any> = [
    { data: [], label: 'Market Value' }
    , { data: [], label: 'Cost Basis' }
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartColors: Array<any> = [
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
