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
  SaveAsFile(textToBeSaved:string,filename:string) {
    var blob = new Blob([textToBeSaved], { type: "text/plain;charset=utf-8" });
    saveAs(blob,filename);
  }
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
