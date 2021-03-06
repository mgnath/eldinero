import { BrowserModule, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { UtilService } from './shared/services/util.service';
import { MapToIterablePipe } from './shared/pipes/map-to-iterable.pipe';
import { ChangecolorPipe } from './shared/pipes/changecolor.pipe';
import { ColoredTextComponent } from './shared/components/colored-text/colored-text.component';
import { NewTickerComponent } from './new-ticker/new-ticker.component';
import { AlphavantageService } from './shared/services/alphavantage.service';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PortfolioService } from './shared/services/portfolio.service';
import { PortfolioCardComponent } from './shared/components/portfolio-card/portfolio-card.component';
import { SettingsComponent } from './settings/settings.component';
import { PreferenceService } from './shared/services/preference.service';
import { HistChartComponent } from './hist-chart/hist-chart.component';
import { StocksApiService } from './shared/services/stocksapi.service';
import { StocksRepoService } from './shared/services/stocks-repo.service';
import { MarketService } from './shared/services/market.service';
import { DateFormatPipe } from './shared/pipes/date-format.pipe';
import { EdMaterialModule } from './edmaterial-module/edmaterial.module';
import { IexService } from './shared/services/iex.service';

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
    PortfolioCardComponent,
    SettingsComponent,
    HistChartComponent,
    DateFormatPipe
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    EdMaterialModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ChartsModule
  ],
  providers: [UtilService, AlphavantageService, PortfolioService,
    PreferenceService, Title, StocksApiService, StocksRepoService, MarketService, IexService],
  bootstrap: [AppComponent]
})
export class AppModule { }
