import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';

@Injectable()
export class UtilService {
  constructor() { }
  private S4(): string { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
  generateGUID(): string {
    return (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0, 3) + "-" + this.S4() + "-"
      + this.S4() + this.S4() + this.S4()).toLowerCase();
  }

  static getSum(objArr:any[],propName:string){
    return objArr.reduce(
      function (p, c, i) { return Number(p) + Number(c[propName]) }, 0);
  }
   getSum(objArr:any[],propName:string){
    return objArr.reduce(
      function (p, c, i) { return Number(p) + Number(c[propName]) }, 0);
  }
  SaveAsFile(textToBeSaved:string,filename:string) {
    var blob = new Blob([textToBeSaved], { type: "text/plain;charset=utf-8" });
    saveAs(blob,filename);
  }
  /* importTransactions() { /// csv parsing function
    var transactions = this.utilService.CSVToArray(this.importText, null);
    transactions.forEach(trans => {
      let currTrans: Transaction = new Transaction(trans[1], trans[0], new Date(trans[3]), TransactionType.BUY, <number>(trans[4]), false, <number>(trans[5]));
      this.addTrans(currTrans);
      this.positions = this.financeService.getAllPositions();
    });
  } */
  CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
      (
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
      var strMatchedDelimiter = arrMatches[1];
      if (
        strMatchedDelimiter.length &&
        (strMatchedDelimiter != strDelimiter)
      ) {
        arrData.push([]);
      }
      if (arrMatches[2]) {
        var strMatchedValue = arrMatches[2].replace(
          new RegExp("\"\"", "g"),
          "\""
        );
      } else {
        var strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
  }
}
