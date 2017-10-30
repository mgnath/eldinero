export class StockPosition{
    id:string;
    name:string;
    symbol:string;
    quote:number;
    transactions:Transaction[];
    constructor(){}
}

export class Transaction {
    id:string;
    name:string;
    symbol:string;
    date:Date;
    type:TransactionType;
    shares:number;
    price:number;
    isDrip:boolean;
    quote:number;
    constructor(
        name:string,
        symbol:string,
        date:Date,
        type:TransactionType,
        shares:number,
        isDrip:boolean,
        price:number){ 
            this.name = name; this.symbol = symbol; this.date=date; 
            this.type = type; this.shares = shares; this.isDrip = isDrip;
            this.price = price;
        }
}
export enum TransactionType {
    BUY,
    SELL,
}