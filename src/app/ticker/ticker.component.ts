import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.css']
})
export class TickerComponent implements OnInit {
  price:number;
  @Input() symbol: string;
  constructor() { }

  ngOnInit() {
  }

}
