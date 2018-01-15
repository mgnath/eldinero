import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule,MatToolbarModule,
        MatSidenavModule,MatIconModule,MatFormFieldModule,
        MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
        MatProgressSpinnerModule,MatSliderModule,MatRadioModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule,MatSliderModule,MatRadioModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule,MatSliderModule,MatRadioModule],
  declarations: []
})
export class EdMaterialModule { }
