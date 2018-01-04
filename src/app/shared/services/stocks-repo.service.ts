import { Injectable } from '@angular/core';
import { StockPrice } from './stocksapi.service';

@Injectable()
export class StocksRepoService {

  constructor() { }
  private archiveKey: string = "eld_archive_intraday_v6";
  getArchive(): StockPrice[] {
    return <StockPrice[]>(JSON.parse(localStorage.getItem(this.archiveKey)));
  }
  saveStockPrice(sp: StockPrice): boolean {
    let repo = <StockPrice[]>(JSON.parse(localStorage.getItem(this.archiveKey))) || new Array<StockPrice>();
    let symRepo = repo.filter(s => s.sym == sp.sym);
    if (symRepo.length > 1) {
      if ((new Date().valueOf() - new Date(symRepo[symRepo.length - 1].t).valueOf()) < 60000) { return false; }
    }
    let newRepo = repo.filter(s => (new Date().valueOf() - new Date(s.t).valueOf()) < 86400000) || [];
    sp.t = new Date();
    newRepo.push(sp);
    localStorage.setItem(this.archiveKey, JSON.stringify(newRepo));
    return true;
  }
}
