import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {EdMaterialModule} from './edmaterial-module/edMaterial.module';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FinanceService } from './shared/services/finance.service';
import { UtilService } from './shared/services/util.service';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    EdMaterialModule,
    FormsModule
  ],
  providers: [FinanceService, UtilService],
  bootstrap: [AppComponent]
})
export class AppModule { }
