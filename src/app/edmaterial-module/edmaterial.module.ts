import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule, MatToolbarModule,
        MatSidenavModule, MatIconModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatTableModule, MatCardModule,
        MatProgressSpinnerModule, MatSliderModule, MatRadioModule, 
        MatDatepickerModule, MatNativeDateModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule,
            MatSidenavModule, MatIconModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatTableModule, MatCardModule,
            MatProgressSpinnerModule, MatSliderModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule,
            MatSidenavModule, MatIconModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatTableModule, MatCardModule,
            MatProgressSpinnerModule, MatSliderModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule],
  declarations: []
})
export class EdMaterialModule { }
