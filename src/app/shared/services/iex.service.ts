import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { CacheService } from './cache.service';
@Injectable({
  providedIn: 'root'
})
export class IexService {
  readonly IEX_BASE_URL = 'https://api.iextrading.com/1.0/stock/';
  constructor(private http: HttpClient, private cacheSrv: CacheService) { }
  async getAdjustedDividends(symbol: string): Promise<any[]> {
    let divs = await this.getDividends(symbol);
    let divs2 = await Promise.all(divs.map(async e => {
                                              const mult = await this.getSplitMultiplier(symbol, e.exDate);
                                              e.amount =  e.amount * mult;
                                              return e;
                                            }
                        ));
    return divs2;
  }
  async getDividends(symbol: string): Promise<any[]> {
    if (this.cacheSrv.getCache(symbol + '_Div')) {
      return this.cacheSrv.getCache(symbol + '_Div');
    }
    const resp = await this.http.get<Array<any>>(this.IEX_BASE_URL + symbol + '/dividends/5y').toPromise();
    this.cacheSrv.setCache(symbol + '_Div', new Date(new Date().getTime() + 86400000), resp);
    return resp;
  }

  async getSplitMultiplier(symbol: string, asOfDate: Date): Promise<number> {
    let splitsResp: any[] = null;
    let splitRatio = 1;
    if (this.cacheSrv.getCache(symbol + '_splits')) {
      splitsResp = this.cacheSrv.getCache(symbol + '_splits');
    } else {
      splitsResp = await this.http.get<Array<any>>(this.IEX_BASE_URL + symbol + '/splits/5y').toPromise();
      this.cacheSrv.setCache(symbol + '_splits', new Date(new Date().getTime() + 86400000), splitsResp);
    }
    if ( splitsResp && splitsResp.length > 0) {
      const postSplits = splitsResp.filter( split => new Date(split.exDate) >= new Date(asOfDate));
      postSplits.forEach( split =>  splitRatio = splitRatio * split.ratio );
    }
    return splitRatio;
  }
}
