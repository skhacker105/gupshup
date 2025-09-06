import { NgModule } from '@angular/core';
import { LongPressDirective, SwipeRightDirective } from './directives';
import { SelectableRowComponent } from './components/selectable-row/selectable-row.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentFolderIconComponent } from './components/document-folder-icon/document-folder-icon.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ConfirmDeleteDialogComponent } from './components/confirm-delete-dialog/confirm-delete-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { BytesToGBPipe } from './pipes/bytes-to-gb.pipe';
import { StorageAccountsComponent } from './components/storage-accounts/storage-accounts.component';
@NgModule({
    declarations: [
        SwipeRightDirective, LongPressDirective, BytesToGBPipe,
        SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent, ConfirmDeleteDialogComponent, ConfirmDialogComponent, StorageAccountsComponent
    ],
    imports: [
        FormsModule, CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatIconModule,
        MatMenuModule
    ],
    exports: [
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatIconModule,
        MatMenuModule,
        SwipeRightDirective, LongPressDirective, BytesToGBPipe,
        SelectableRowComponent, LayoutComponent, DocumentFolderIconComponent, FileUploadComponent, BreadcrumbComponent, ConfirmDeleteDialogComponent, ConfirmDialogComponent, StorageAccountsComponent
    ]
})
export class SharedModule { }
