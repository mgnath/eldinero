import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule,MatToolbarModule,
        MatSidenavModule,MatIconModule,MatFormFieldModule,
        MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
        MatProgressSpinnerModule,MatSliderModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule,MatSliderModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule,MatSliderModule],
  declarations: []
})
export class EdMaterialModule { }
