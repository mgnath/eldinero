import { UtilService } from "../services/util.service";

export class StockPosition {
    id: string;
    name: string;
    symbol: string;
    quote: number;
    adj_prev_close: number;
    transactions: Transaction[];
    shares(): number {
        return UtilService.getSum(this.transactions, "shares");
    }
    avgPrice(): number {
        return Math.round((this.totalCostBasis() / this.shares()) * 1000) / 1000;
    }
    totalCostBasis(): number {
        return this.transactions.reduce(function (p, c, i) {
            return p + (c.price * c.shares);
        }, 0);
    }
    marketValue():number{ return this.shares()*this.quote;}
    unrealizedGainLoss():number{ return this.marketValue()-this.totalCostBasis();}
    gainLossPer() {
        var origCos = this.totalCostBasis();
        return ((this.marketValue() - origCos) / origCos) * 100;
    }
    constructor() { }
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