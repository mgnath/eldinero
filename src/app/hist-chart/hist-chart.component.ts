import { Component, OnInit, Input } from '@angular/core';
import { Portfolio, Transaction } from '../shared/models/entities';
import { AlphavantageService } from '../shared/services/alphavantage.service';

@Component({
  selector: 'app-hist-chart',
  templateUrl: './hist-chart.component.html',
  styleUrls: ['./hist-chart.component.css']
})
export class HistChartComponent implements OnInit {

  constructor(private alphSrv: AlphavantageService) { }

  @Input() currPortfolio: Portfolio;
  histArray: any[] = [];
  graphDuration: number = 7;

  ngOnInit() {
    this.historicalData();
  }


  historicalData() {
    this.histArray = [];
    let trans: Array<Transaction> = new Array<Transaction>();
    this.currPortfolio.positions.map(pos => pos.transactions).forEach(
      t => { t.forEach(e => trans.push(e)) }
    );
    trans.forEach((tran, idx) => {
      setTimeout(() => {
        this.alphSrv.getHistoricalData(tran.symbol.replace('.', '-'),"TIME_SERIES_DAILY_ADJUSTED")
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
                  var results = this.histArray.find(e => e.tradeDate === key);
                  if (!results) {
                    this.histArray.push({ tradeDate: key, dailyTot:0,costBasis:0});
                  }
                });
              Object.keys(d[timeKey]).forEach(
                key => {
                  var results = this.histArray.find(e => e.tradeDate === key);
                  if (results) {
                    if (new Date(key).valueOf() > (new Date(tran.date).valueOf()- 86400000)) {
                      
                      results.dailyTot += d[timeKey][key][closeKey] * tran.shares;
                      results.costBasis += tran.price * tran.shares;
                    }
                  }
                }
              );
              let totLen = this.histArray.length;
              this.lineChartData[0].data = this.histArray.map(e => e.dailyTot.toFixed(2)).reverse();//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartData[1].data = this.histArray.map(e => e.costBasis.toFixed(2)).reverse();//.slice(Math.max(totLen - this.graphDuration, 1));
              this.lineChartLabels = this.histArray.map(e => e.tradeDate).reverse();//.slice(Math.max(totLen - this.graphDuration, 1));
            } catch (ex) { console.log('error in' + ex); }
          }, err => { console.log(err) });
      }, (idx + 1) * 2);
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
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

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
