import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../shared/services/portfolio.service';
import { UtilService } from '../shared/services/util.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private portfolioSrv:PortfolioService, private utilService:UtilService) { }

  ngOnInit() {
  }
  openFile(event) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
      let reader = new FileReader();
      reader.onload = () => {
        this.importJsonTrans(reader.result);
      }
      reader.readAsText(input.files[index]);
    };
  }
  importJsonTrans(jsonText: string) {
    var portfolioObj = JSON.parse(jsonText);
    this.portfolioSrv.replacePortfolios(portfolioObj);
  }
  SaveAsFile() {

    this.utilService.SaveAsFile(JSON.stringify(this.portfolioSrv.getData()), "myportfolio.json");
 }
}
