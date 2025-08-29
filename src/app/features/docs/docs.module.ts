import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { DocsRoutingModule } from './docs-routing.module';
import { DocsListComponent } from './components/docs-list/docs-list.component';
import { FolderCreateComponent } from './components/folder-create/folder-create.component';
import { FolderSelectDialogComponent } from './components/docs-list/docs-list.component';

@NgModule({
  declarations: [
    DocsListComponent,
    FolderCreateComponent,
    FolderSelectDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    DocsRoutingModule
  ]
})
export class DocsModule { }