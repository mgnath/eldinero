import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import {EdMaterialModule} from './edmaterial-module/edMaterial.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { UtilService } from './shared/services/util.service';
import { MapToIterablePipe } from './shared/pipes/map-to-iterable.pipe';
import { ChangecolorPipe } from './shared/pipes/changecolor.pipe';
import { ColoredTextComponent } from './shared/components/colored-text/colored-text.component';
import { NewTickerComponent } from './new-ticker/new-ticker.component';
import { MAT_PLACEHOLDER_GLOBAL_OPTIONS } from '@angular/material';
import { AlphavantageService } from './shared/services/alphavantage.service';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PortfolioService } from './shared/services/portfolio.service';
import { PortfolioCardComponent } from './shared/components/portfolio-card/portfolio-card.component';
import { RobinhoodRxService } from './shared/services/robinhood-rx.service';
 
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MapToIterablePipe,
    ChangecolorPipe,
    ColoredTextComponent,
    NewTickerComponent,
    PortfolioComponent,
    DashboardComponent,
    PortfolioCardComponent
  ], 
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    EdMaterialModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    HttpModule
  ],
  providers: [UtilService,AlphavantageService, PortfolioService,RobinhoodRxService,
    {provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: {float: 'auto'}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
