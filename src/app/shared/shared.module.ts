import { NgModule } from '@angular/core';
import { LongPressDirective, SwipeRightDirective } from './directives';
import { SelectableRowComponent } from './components/selectable-row/selectable-row.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFolderIconComponent } from './components/document-folder-icon/document-folder-icon.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './components/confirm-delete-dialog/confirm-delete-dialog.component';

@NgModule({
    declarations: [
        SwipeRightDirective, LongPressDirective,
        SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent, ConfirmDeleteDialogComponent
    ],
    imports: [FormsModule, CommonModule, MatDialogModule],
    exports: [
        MatDialogModule,
        SwipeRightDirective, LongPressDirective,
        SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent, ConfirmDeleteDialogComponent
    ]
})
export class SharedModule { }