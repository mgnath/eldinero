import { Component, OnInit, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ed-colored-text',
  templateUrl: './colored-text.component.html',
  styleUrls: ['./colored-text.component.css']
})
export class ColoredTextComponent implements OnInit {
  @Input() num: number;
  @Input() noColor = false;
  constructor() { }

  ngOnInit() {
  }
}
