import { Component, OnInit, Input } from '@angular/core';
import { Portfolio, Transaction } from '../shared/models/entities';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { StocksApiService } from '../shared/services/stocksapi.service';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
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
  graphDuration: number = 7;


  ngOnInit() {
    this.historicalData();
    this.dailyChart();
    IntervalObservable.create(60001).subscribe(() => {
      console.log("updating intra day graph");
      this.dailyChart();
    });
  }
  public lineChartDataDaily: Array<any> = [
    { data: [7, 9, 8], label: 'Intra Day Value' }
  ];
  public lineChartLabelsDaily: Array<any> = ['a', 'b', 'c'];
  public lineChartOptionsDaily: any = {
    responsive: true
  };
  public lineChartLegendDaily: boolean = true;
  public lineChartTypeDaily: string = 'line';
  public lineChartColorsDaily: Array<any> = [
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


  dailyChart() {
    this.intraDayArray = [];
    var intervals: Date[] = [];
    let today = new Date();
    let gap = 60000;
    intervals.push(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 25, 0, 0));
    for (var i = 1; i < 800; i++) {
      intervals.push(new Date(intervals[i - 1].valueOf() + gap));
    }
   /*  this.intraDayArray.push(
      {
        time: new Date(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0, 0)),
        intrdayTot: this.currPortfolio.getPrevDayCloseTotal()
      }
    ); */
    intervals.forEach(i => {
      this.intraDayArray.push({ time: i, intrdayTot: 0 });
    });
    //console.log(this.intraDayArray);
    let trans: Array<Transaction> = new Array<Transaction>();
    this.currPortfolio.positions.map(pos => pos.transactions).forEach(
      t => { t.forEach(e => trans.push(e)) }
    );
    this.currPortfolio.positions.forEach((tran, idx) => {
      let sps = this.sapi.getHistory(tran.symbol,
        new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 25, 0, 0),
        new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 1, 0, 0)
      );
      //console.log(sps);
      this.intraDayArray.forEach(i => {
        let intSps = sps.filter(sp => {
          return new Date(sp.t).valueOf() >= i.time.valueOf()
            && new Date(sp.t).valueOf() <= i.time.valueOf() + gap - 1
        });

        if (intSps && intSps.length > 0) {
          i.intrdayTot += intSps[intSps.length-1].price * tran.shares;
        }
      });
    });
    let baseline = this.currPortfolio.getPrevDayCloseTotal();
    this.lineChartDataDaily[0].data = this.intraDayArray
      .filter(e => e.intrdayTot > baseline/2)
      .map(e => e.intrdayTot);
    this.lineChartLabelsDaily = this.intraDayArray
      .filter(e => e.intrdayTot > baseline/2)
      .map(e => e.time.getHours() + ':' + e.time.getMinutes() + ':' + e.time.getSeconds());

  }

  historicalData() {
    this.histArray = [];

    let trans: Array<Transaction> = new Array<Transaction>();
    this.currPortfolio.positions.map(pos => pos.transactions).forEach(
      t => { t.forEach(e => trans.push(e)) }
    );

    trans.forEach((tran, idx) => {
      setTimeout(() => {
        this.alphSrv.getHistoricalData(tran.symbol.replace('.', '-'), "TIME_SERIES_DAILY_ADJUSTED")
          .subscribe(d => {
            try {

              if (!(d["isCache"] && d["isCache"] == true)) {
                d["Meta Data"]["3. Last Refreshed"] = new Date();
              }
              localStorage.setItem(tran.symbol.replace('.', '-') + '_Hist', JSON.stringify(d));
              let timeKey: string = "Time Series (Daily)";//"Monthly Time Series";
              //let timeKey: string = "Monthly Adjusted Time Series";
              let closeKey: string = "4. close";
              Object.keys(d[timeKey]).forEach(
                key => {
                  var results = this.histArray.find(e => e.tradeKey === key);
                  if (!results && key != '2017-08-04') {
                    this.histArray.push({ tradeKey: key, tradeDate: new Date(key), dailyTot: 0, costBasis: 0 });
                  }
                });
              Object.keys(d[timeKey]).forEach(
                key => {

                  var results = this.histArray.find(e => e.tradeKey === key);
                  if (results && key != '2017-08-04') {
                    if (new Date(key).valueOf() > (new Date(tran.date).valueOf() - 86400000)) {
                      results.dailyTot += d[timeKey][key][closeKey] * tran.shares;
                      results.costBasis += tran.price * tran.shares;
                    }
                  }
                }
              );

              this.lineChartData[0].data = this.histArray.map(e => e.dailyTot.toFixed(2)).reverse();//.slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartData[1].data = this.histArray.map(e => e.costBasis.toFixed(2)).reverse();//.slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartLabels = this.histArray.map(e => e.tradeKey).reverse();//.slice(0,99);//.slice(Math.max(totLen - this.graphDuration, 1));
            } catch (ex) { console.log('error in' + ex); }
          }, err => { console.log(err) });
      }, (idx + 1) * 2000);
    });
  }
  /*
      else {
        console.log('leak');
        if (new Date(key).valueOf() >= new Date(tran.date).valueOf()) {
          this.histArray.push({ tradeDate: key, dailyTot: d[timeKey][key][closeKey] * tran.shares,
              costBasis: tran.price * tran.shares });
        }
      } */
  // lineChart
  public lineChartData: Array<any> = [
    { data: [], label: 'Market Value' }
    , { data: [], label: 'Cost Basis' }
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';
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


  public randomize(): void {
    let _lineChartData: Array<any> = new Array(this.lineChartData.length);
    for (let i = 0; i < this.lineChartData.length; i++) {
      _lineChartData[i] = { data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label };
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
      }
    }
    this.lineChartData = _lineChartData;
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
