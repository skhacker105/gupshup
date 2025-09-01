import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { AppService, DocumentService } from '../../../../services';
import { Document } from '../../../../models';

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  documents: Document[] = [];
  selectedItems: Document[] = [];
  multiSelectMode = false;

  groupBy = '';
  orderBy = '';
  loading = false;
  errorMessage = '';

  constructor(
    private documentService: DocumentService,
    private dialog: MatDialog,
    public appService: AppService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadDocuments();
  }

  enableMobileMultiSelect(): void {
    this.multiSelectMode = true;
  }

  rowClick(doc: Document, event: MouseEvent): void {
    if (this.multiSelectMode) {
      this.toggleSelect(doc, event);
    } else {
      // open preview / details
    }
  }

  toggleSelect(doc: Document, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSelected(doc)) {
      this.selectedItems = this.selectedItems.filter(d => d !== doc);
    } else {
      this.selectedItems.push(doc);
    }
    this.multiSelectMode = this.selectedItems.length > 0;
  }

  isSelected(doc: Document): boolean {
    return this.selectedItems.includes(doc);
  }

  cancelMultiSelect(): void {
    this.selectedItems = [];
    this.multiSelectMode = false;
  }

  async deleteSelected(): Promise<void> {
    if (!this.selectedItems.length) return;
    for (const doc of this.selectedItems) {
      await this.deleteDocument(doc.id);
    }
    this.cancelMultiSelect();
  }

  // Document CRUD
  async loadDocuments(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.documents = await this.documentService.getDocuments({
        groupBy: this.groupBy,
        orderBy: this.orderBy
      });
      console.log('this.documents = ', this.documents)
    } catch {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  async addNewFile(): Promise<void> {
    // const dialogRef = this.dialog.open(FolderCreateComponent, {
    //   width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
    //   maxHeight: this.appService.isMobile ? '80vh' : '70vh'
    // });
    // dialogRef.afterClosed().subscribe(async (name: string | undefined) => {
    //   if (name) {
    //     try {
    //       await this.documentService.createFolder(name);
    //       await this.loadDocuments();
    //     } catch {
    //       this.errorMessage = 'Failed to create folder.';
    //     }
    //   }
    // });
  }

  async deleteDocument(id: string, event?: MouseEvent): Promise<void> {
    event?.stopPropagation();
    this.loading = true;
    try {
      await this.documentService.deleteDocument(id, false);
      this.documents = this.documents.filter(d => d.id !== id);
    } catch {
      this.errorMessage = 'Failed to delete document.';
    }
    this.loading = false;
  }

  // Folder CRUD
  async loadFolders(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      // this.documents = await this.documentService.getDocuments({
      //   groupBy: this.groupBy,
      //   orderBy: this.orderBy
      // });
      // console.log('this.folders = ', this.folders)
    } catch {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  async createFolder(): Promise<void> {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh'
    });
    dialogRef.afterClosed().subscribe(async (name: string | undefined) => {
      if (name) {
        try {
          await this.documentService.createFolder(name);
          await this.loadDocuments();
        } catch {
          this.errorMessage = 'Failed to create folder.';
        }
      }
    });
  }
}
