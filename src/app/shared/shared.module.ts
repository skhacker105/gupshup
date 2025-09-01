import { NgModule } from '@angular/core';
import { SwipeRightDirective } from './directives';
import { SelectableRowComponent } from './components/selectable-row/selectable-row.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFolderIconComponent } from './components/document-folder-icon/document-folder-icon.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

@NgModule({
    declarations: [SwipeRightDirective, SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent],
    imports: [FormsModule, CommonModule],
    exports: [SwipeRightDirective, SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent]
})
export class SharedModule { }