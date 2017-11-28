import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule,MatToolbarModule,
        MatSidenavModule,MatIconModule,MatFormFieldModule,
        MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
        MatProgressSpinnerModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule,
            MatProgressSpinnerModule],
  declarations: []
})
export class EdMaterialModule { }
