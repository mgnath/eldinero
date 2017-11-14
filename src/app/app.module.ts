import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import {EdMaterialModule} from './edmaterial-module/edMaterial.module';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FinanceService } from './shared/services/finance.service';
import { UtilService } from './shared/services/util.service';
import { MapToIterablePipe } from './shared/pipes/map-to-iterable.pipe';
import { StockService } from './shared/services/stock.service';
import { ChangecolorPipe } from './shared/pipes/changecolor.pipe';
import { ColoredTextComponent } from './shared/components/colored-text/colored-text.component';
import { NewTickerComponent } from './new-ticker/new-ticker.component';
import { MAT_PLACEHOLDER_GLOBAL_OPTIONS } from '@angular/material';

 
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MapToIterablePipe,
    ChangecolorPipe,
    ColoredTextComponent,
    NewTickerComponent
  ], 
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    EdMaterialModule,
    FormsModule,
    HttpClientModule,
    HttpModule
  ],
  providers: [FinanceService, UtilService, StockService,
    {provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: {float: 'auto'}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
