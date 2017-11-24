import { NgModule } from '@angular/core';

import {MatButtonModule, MatCheckboxModule,MatToolbarModule,
        MatSidenavModule,MatIconModule,MatFormFieldModule,
        MatInputModule,MatSelectModule,MatTableModule,MatCardModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule, 
            MatSidenavModule, MatIconModule,MatFormFieldModule,
            MatInputModule,MatSelectModule,MatTableModule,MatCardModule],
  declarations: []
})
export class EdMaterialModule { }
