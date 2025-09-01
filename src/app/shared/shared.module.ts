import { NgModule } from '@angular/core';
import { SwipeRightDirective } from './directives';
import { SelectableRowComponent } from './components/selectable-row/selectable-row.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFolderIconComponent } from './components/document-folder-icon/document-folder-icon.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

@NgModule({
    declarations: [SwipeRightDirective, SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent],
    imports: [FormsModule, CommonModule],
    exports: [SwipeRightDirective, SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent]
})
export class SharedModule { }