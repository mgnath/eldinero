import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'changecolor'
})
export class ChangecolorPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }
  transform(value: number, args?: any): any {
    return value > 0 ?
    this.sanitizer.bypassSecurityTrustHtml("<span class='green'>"+value+"</span>") :
          value === 0  ?
          value :
          this.sanitizer.bypassSecurityTrustHtml("<span class='red'>"+value+"</span>");
  }
}