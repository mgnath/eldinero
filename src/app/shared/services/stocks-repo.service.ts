import { Injectable } from '@angular/core';
import { StockPrice } from './stocksapi.service';

@Injectable()
export class StocksRepoService {

  constructor() { }
  private archiveKey:string = "eld_archive_intraday_v6";
  getArchive():StockPrice[]{
    return <StockPrice[]>(JSON.parse(localStorage.getItem(this.archiveKey)));
  }
  saveStockPrice(sp:StockPrice):boolean{
    let repo = <StockPrice[]>(JSON.parse(localStorage.getItem(this.archiveKey))) || new Array<StockPrice>(); 
    let filteredRepo = repo.filter(s=>s.sym == sp.sym);
    if(filteredRepo.length > 1)
    {
      if ((new Date().valueOf() - new Date(filteredRepo[filteredRepo.length - 1].t).valueOf()) < 60000) { return false; }
      //console.log(filteredRepo.length+filteredRepo[filteredRepo.length - 1].sym + filteredRepo[filteredRepo.length - 1].t);
      sp.t = new Date();
      repo.push(sp);
      localStorage.setItem( this.archiveKey, JSON.stringify(repo)); 
      return true;
    }
    else{
      repo.push(sp);
      localStorage.setItem( this.archiveKey, JSON.stringify(repo)); 
      return true;
    }
  }

}
