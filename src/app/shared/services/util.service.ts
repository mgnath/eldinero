import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {
  constructor() { }
  private S4(): string { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
  generateGUID(): string {
    return (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0, 3) + "-" + this.S4() + "-"
      + this.S4() + this.S4() + this.S4()).toLowerCase();
  }
}
