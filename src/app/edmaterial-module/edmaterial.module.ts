import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule,MatToolbarModule,
        MatSidenavModule,MatIconModule,MatFormFieldModule,
        MatInputModule,MatSelectModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule],
  declarations: []
})
export class EdMaterialModule { }
