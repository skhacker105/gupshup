import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    DocsRoutingModule,
    SharedModule
  ]
})
export class DocsModule { }
