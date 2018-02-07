import { Injectable } from '@angular/core';

@Injectable()
export  class PreferenceService {
  readonly CURR_VER:string = "1";
  constructor() { }
  get appSettings(){
    return this.loadData();
  }
  saveData(settingsData: any) {
    localStorage.setItem("eldinero.settings.v" + this.CURR_VER, JSON.stringify(settingsData));
  }
  loadData(){
     return JSON.parse(localStorage.getItem("eldinero.settings.v"+ this.CURR_VER)) || {refreshrate:15000, cloudurl:""};
  }
}
