import { Component, OnInit, Input } from '@angular/core';
import { Portfolio, Transaction } from '../shared/models/entities';
import { AlphavantageService } from '../shared/services/alphavantage.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-hist-chart',
  templateUrl: './hist-chart.component.html',
  styleUrls: ['./hist-chart.component.css']
})
export class HistChartComponent implements OnInit {

  constructor(private alphSrv: AlphavantageService) { }

  @Input() currPortfolio: Portfolio;
  histArray: any[] = [];
  graphDuration:number = 7;
  //this.lineChartData[0].data = marketData.map(e=>e.dailyTot);
  //this.lineChartLabels =  marketData.map(e=>e.tradeDate);
  //console.log(this.lineChartData[0].data);

  ngOnInit() {
    this.historicalData();
  }


  historicalData() {
    this.histArray = [];
    let trans: Array<Transaction> = new Array<Transaction>();
    this.currPortfolio.positions.map(pos => pos.transactions).forEach(
      t => { t.forEach(e => trans.push(e)) }
    );
    console.log(trans);
    trans.forEach((tran, idx) => {
      setTimeout(() => {
        this.alphSrv.getHistoricalData(tran.symbol.replace('.', '-'))
          .subscribe(d => {
            //try {

            localStorage.setItem(tran.symbol.replace('.', '-') + '_Hist', JSON.stringify(d));

            let temp: any = {};
            temp.symbol = tran.symbol;
            let timeKey: string = "Time Series (Daily)";//"Monthly Time Series";
            Object.keys(d[timeKey]).forEach(
              key => {
                var results = this.histArray.find(e => e.tradeDate === key);
                if (results) {
                  //results.dailyTot += d[timeKey][key]["4. close"] * tran.shares;
                 if(new Date(key).valueOf()  >= new Date(tran.date).valueOf() ){
                    results.dailyTot += d[timeKey][key]["4. close"] * tran.shares;
                    results.costBasis += tran.price * tran.shares;
                  }
                  else{
                    //results.dailyTot += tran.price * tran.shares;
                    //results.costBasis += tran.price * tran.shares;
                  }
                }
                else {
                  //this.histArray.push({ tradeDate: key, dailyTot: d[timeKey][key]["4. close"] * tran.shares });
                  
                  if(new Date(key).valueOf()  >= new Date(tran.date).valueOf() ){
                    this.histArray.push({ tradeDate: key, dailyTot: d[timeKey][key]["4. close"] * tran.shares, costBasis: tran.price * tran.shares  });
                  }
                  else{
                    this.histArray.push({ tradeDate: key, dailyTot: tran.price * tran.shares,costBasis: tran.price * tran.shares });
                  }
                  
                  
                }
              }
            );
            let totLen = this.histArray.length;
            this.lineChartData[0].data = this.histArray.map(e => e.dailyTot.toFixed(2)).reverse().slice(Math.max( totLen - this.graphDuration, 1));//.splice(100-this.graphDuration,this.graphDuration);
            this.lineChartData[1].data = this.histArray.map(e => e.costBasis.toFixed(2)).reverse().slice(Math.max( totLen - this.graphDuration, 1));//.splice(100-this.graphDuration,this.graphDuration);
            this.lineChartLabels = this.histArray.map(e => e.tradeDate).reverse().slice(Math.max( totLen - this.graphDuration, 1));//.splice(100-(100-this.graphDuration),this.graphDuration);
            //console.log(this.lineChartData[0].data);
            // } catch (ex) { console.log('error in' + ex); }
          });
      }, (idx + 1) * 50);
    });
  }

  // lineChart
  public lineChartData: Array<any> = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Market Value'}
    ,{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Cost Basis' }
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
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
