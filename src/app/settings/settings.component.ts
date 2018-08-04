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
  cloudurl = '';
  constructor(private portfolioSrv: PortfolioService,
    private utilService: UtilService, private prefSrv: PreferenceService) { }

  ngOnInit() {
    this.refreshRate = this.prefSrv.appSettings.refreshRate / 1000;
    this.cloudurl = this.prefSrv.appSettings.cloudurl;
  }
  openFile(event) {
    const input = event.target;
    for (let index = 0; index < input.files.length; index++) {
      const reader = new FileReader();
      reader.onload = () => {
        this.importJsonTrans(reader.result);
      };
      reader.readAsText(input.files[index]);
    }
  }
  importJsonTrans(jsonText: string) {
    const portfolioObj = JSON.parse(jsonText);
    this.portfolioSrv.replacePortfolios(portfolioObj);
  }
  SaveAsFile() {
    const portfolioCopy: Portfolio[] = this.portfolioSrv.getData();
    portfolioCopy.forEach(p => { p.positions.forEach( pos => pos.latestQuote = null ); });
    this.utilService.SaveAsFile(JSON.stringify(this.portfolioSrv.getData()), 'myportfolio.json');
  }
  saveRefreshRate() {
    this.prefSrv.saveData({refreshRate: this.refreshRate * 1000, cloudurl: this.cloudurl});
  }
  saveSettings() {
    this.prefSrv.saveData({refreshRate: this.refreshRate * 1000, cloudurl: this.cloudurl});
  }
}
