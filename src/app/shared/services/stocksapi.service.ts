import { Injectable } from '@angular/core';

@Injectable()
export class StocksApiService {

  constructor() { }

}
export class Stock{
  id:string;
  symbol:string;
  market:string;
  timestamp:Date;
  last_traded_price:number;
  volume:number;
  constructor() { }
}
