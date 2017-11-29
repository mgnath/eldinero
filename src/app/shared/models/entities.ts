import { UtilService } from "../services/util.service";
export class Portfolio {
    id: string;
    portfolioName: string;
    positions: StockPosition[];
    version: string;
    constructor() { }
    getGrandTotal() {
        var totSum: number = 0;
        this.positions.forEach(
            pos => (
                totSum += pos.marketValue()
            )
        );
        return totSum;
    }
    getGrandTotalGain() {
        var totSum: number = 0;
        this.positions.forEach(
            pos => (
                totSum += pos.unrealizedGainLoss())
        );
        return totSum;
    }
    getGrandTotalGainPer() {
        var origCos = this.getGrandCostBasis();
        return ((this.getGrandTotal() - origCos) / origCos) * 100;
    }
    getGrandCostBasis() {
        var totSum: number = 0;
        this.positions.forEach(
            pos => (
                totSum += pos.totalCostBasis()
            )
        );
        return totSum;
    }
    getGrandTotalDayGain() {

        var totSum: number = 0;
        this.positions.forEach(
            pos => (
                totSum +=
                pos.marketValue() - (pos.latestQuote.adjusted_previous_close * pos.shares)
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
    constructor() { }
}
export class StockPosition {
    id: string;
    name: string;
    symbol: string;
    latestQuote: quote;
    transactions: Transaction[];
    constructor() { }
    get shares(): number {
        return UtilService.getSum(this.transactions, "shares");
    }
    get avgPrice(): number {
        return Math.round((this.totalCostBasis() / this.shares * 1000) / 1000);
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
        return this.transactions.reduce(function (p, c, i) {
            return p + (c.price * c.shares);
        }, 0);
    }
    marketValue(): number { return this.shares * this.latestQuote.last_trade_price; }
    unrealizedGainLoss(): number { return this.marketValue() - this.totalCostBasis(); }
    gainLossPer() {
        var origCos = this.totalCostBasis();
        return ((this.marketValue() - origCos) / origCos) * 100;
    }
    addTransction(t: Transaction) {
        t.id = UtilService.generateGUID();
        t.date = new Date();
        t.symbol = this.symbol;
        this.transactions = this.transactions || [];
        this.transactions.push(t);
        return this;
    }
}

export class Transaction {
    id: string;
    name: string;
    symbol: string;
    date: Date;
    type: TransactionType;
    shares: number;
    price: number;
    isDrip: boolean;
    quote: number;
    constructor(
        name: string,
        symbol: string,
        date: Date,
        type: TransactionType,
        shares: number,
        isDrip: boolean,
        price: number) {
        this.name = name; this.symbol = symbol; this.date = date;
        this.type = type; this.shares = shares; this.isDrip = isDrip;
        this.price = price;
    }
}
export enum TransactionType {
    BUY,
    SELL,
}