import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DocsRoutingModule } from './docs-routing.module';
import { DocsListComponent } from './components/docs-list/docs-list.component';
import { FolderCreateComponent } from './components/folder-create/folder-create.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DocsListComponent,
    FolderCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    DocsRoutingModule,
    SharedModule
  ]
})
export class DocsModule { }