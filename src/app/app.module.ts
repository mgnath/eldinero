import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';


import {EdMaterialModule} from './edmaterial-module/edMaterial.module';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FinanceService } from './shared/services/finance.service';
import { UtilService } from './shared/services/util.service';
import { MapToIterablePipe } from './shared/pipes/map-to-iterable.pipe';
import { TickerComponent } from './ticker/ticker.component';
import { StockService } from './shared/services/stock.service';
 
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MapToIterablePipe,
    TickerComponent
  ], 
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    EdMaterialModule,
    FormsModule,
    HttpModule
  ],
  providers: [FinanceService, UtilService, StockService],
  bootstrap: [AppComponent]
})
export class AppModule { }
