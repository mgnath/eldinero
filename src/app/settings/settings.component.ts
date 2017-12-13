import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PortfolioService } from '../shared/services/portfolio.service';
import { UtilService } from '../shared/services/util.service';
import { PreferenceService } from '../shared/services/preference.service';
import { Portfolio } from '../shared/models/entities';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class SettingsComponent implements OnInit {
  refreshRate = 3;
  constructor(private portfolioSrv: PortfolioService, 
    private utilService: UtilService, private prefSrv:PreferenceService) { }

  ngOnInit() {
    console.log(this.prefSrv.loadData().refreshRate);
    this.refreshRate = this.prefSrv.appSettings.refreshRate / 1000;
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
    let portfolioCopy:Portfolio[] = this.portfolioSrv.getData();
    portfolioCopy.forEach(p=>{ p.positions.forEach( pos=> pos.latestQuote=null )});
    this.utilService.SaveAsFile(JSON.stringify(this.portfolioSrv.getData()), "myportfolio.json");
  }
  saveRefreshRate(){
    this.prefSrv.saveData({refreshRate:this.refreshRate*1000});
  }
}
