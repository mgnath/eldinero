/* tslint:disable */
import { UtilService } from "../services/util.service";
import { PortfolioService } from "../services/portfolio.service";
import { IexService } from "../services/iex.service";
export class Portfolio {
    id: string;
    portfolioName: string;
    positions: StockPosition[];
    version: string;
    constructor() { }
    getGrandTotal() {
        var totSum: number = 0;
        this.positions.forEach(pos => (totSum += pos.marketValue()));
        return totSum;
    }
    getGrandTotalGain() {
        var totSum: number = 0;
        this.positions.forEach(pos => (totSum += pos.unrealizedGainLoss()));
        return totSum;
    }
    getGrandTotalGainPer() {
        var origCos = this.getGrandCostBasis();
        return ((this.getGrandTotal() - origCos) / origCos) * 100;
    }
    getGrandCostBasis() {
        var totSum: number = 0;
        this.positions.forEach(pos => (totSum += pos.totalCostBasis()));
        return totSum;
    }
    getGrandRealizedGL() {
        var totSum: number = 0;
        this.positions.forEach(pos => (totSum += pos.realizedGainLoss()));
        return totSum;
    }
    
    getGrandTotalDayGain() {
        var totSum: number = 0;
        this.positions.forEach(pos => (
                totSum +=pos.marketValue() - (pos.latestQuote.adjusted_previous_close * pos.shares)
            )
        );
        return totSum;
    }
    getGrandTotalDayGainPer() {
        return  (this.getGrandTotalDayGain()/this.getPrevDayCloseTotal())*100;
    }
    
    getPrevDayCloseTotal() {
        var totSum: number = 0;
        this.positions.forEach(pos => (
                totSum +=(pos.latestQuote.adjusted_previous_close * pos.shares)
            )
        );
        return totSum;
    }
}
export class quote {
    name: string;
    symbol: string;
    last_trade_price: number;
    adjusted_previous_close: number;
    last_extended_hours_trade_price: number;
    updated_at: Date
    instrument:string
    constructor() { }
}
export class StockPosition {
    id: string;
    name: string;
    symbol: string;
    latestQuote: quote;
    totDivEarned: number;
    transactions: Transaction[];
    constructor() { }
    get shares(): number {
        let buy= UtilService.getSum(this.transactions.filter(t=>t.type==TransactionType.BUY), "shares");
        let sell = UtilService.getSum(this.transactions.filter(t=>t.type==TransactionType.SELL), "shares");
        return buy-sell;
    }
   
    get avgPrice(): number {
        if(this.shares > 0){
            return this.totalCostBasis() / this.shares;
        }else{return 0;}
    }
    get dayChange():number{
        return this.latestQuote.last_trade_price - this.latestQuote.adjusted_previous_close;
    }
    get dayChangePer():number{
        return ((this.dayChange) / this.latestQuote.adjusted_previous_close) * 100
    }
    get dayGain():number{
       return  this.dayChange * this.shares;
    }
    totalCostBasis(): number {
        let buyBasis =  this.transactions.filter(t=>t.type==TransactionType.BUY).reduce(function (p, c, i) {
            return p + (c.price * c.shares);
        }, 0);
        let sellBasis =  this.transactions.filter(t=>t.type==TransactionType.SELL).reduce(function (p, c, i) {
            return p + (c.price * c.shares);
        }, 0);
        return buyBasis-sellBasis;
    }
    marketValue(): number { return this.shares * this.latestQuote.last_trade_price; }
    unrealizedGainLoss(): number { return this.marketValue() - this.totalCostBasis(); }
    realizedGainLoss(): number { 
        let gl =  this.transactions.filter(t=>t.type==TransactionType.SELL).reduce(function (p, c, i) {
            return p + ((c.sellprice - c.price) * c.shares);
        }, 0);
        return gl;
    }
    gainLossPer() {
        var origCos = this.totalCostBasis();
        return ((this.marketValue() - origCos) / origCos) * 100;
    }
    addTransction(t: Transaction) {
        t.id = UtilService.generateGUID();
        t.date = new Date();
        t.symbol = this.symbol;
        console.log(t);
        this.transactions = this.transactions || [];
        this.transactions.push(t);
        return this;
    }
}

export class Transaction {
    id: string;
    symbol: string;
    date: Date;
    type: TransactionType;
    shares: number;
    price: number;
    sellprice:number;
    isDrip: boolean;
    quote: number;
    constructor(
        symbol: string,
        date: Date,
        type: TransactionType,
        shares: number,
        isDrip: boolean,
        price: number) {
        this.symbol = symbol; this.date = date;
        this.type = type; this.shares = shares; this.isDrip = isDrip;
        this.price = price;
    }
}
export enum TransactionType {
    BUY,
    SELL,
}