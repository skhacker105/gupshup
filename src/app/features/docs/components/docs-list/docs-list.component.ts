// src/app/components/docs-list/docs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { Folder, Document, IconSize, IPathSegmenmat } from '../../../../models';
import { AppService, DocumentService } from '../../../../services';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

type Item = Document | Folder;

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  documents: Document[] = [];
  folders: Folder[] = [];
  selectedItems: Item[] = [];
  multiSelectMode = false;

  groupBy = '';
  orderBy = '';
  loading = false;
  errorMessage = '';

  currentParentFolder: Folder | undefined = undefined; // Root level
  currentPath: string = '[]'; // Current relative path (JSON string)
  pathSegments: IPathSegmenmat[] = [{ name: 'Root', id: undefined }]; // For breadcrumb
  selectedIconSize: IconSize = IconSize.Medium;
  iconSizes = Object.values(IconSize);

  constructor(
    private documentService: DocumentService,
    private dialog: MatDialog,
    public appService: AppService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadDocumentsAndFolders();
  }

  enableMobileMultiSelect(): void {
    this.multiSelectMode = true;
  }

  rowClick(item: Item, event: MouseEvent): void {
    if (this.multiSelectMode) {
      this.toggleSelect(item, event);
    } else {
      if (!('data' in item)) { // Folder
        this.currentParentFolder = item;
        this.currentPath = item.relativePath;
        this.updatePathSegments();
        this.loadDocumentsAndFolders();
      } else {
        // Open document
      }
    }
  }

  toggleSelect(item: Item, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter(d => d !== item);
    } else {
      this.selectedItems.push(item);
    }
    this.multiSelectMode = this.selectedItems.length > 0;
  }

  isSelected(item: Item): boolean {
    return this.selectedItems.includes(item);
  }

  cancelMultiSelect(): void {
    this.selectedItems = [];
    this.multiSelectMode = false;
  }

  async deleteSelected(): Promise<void> {
    if (!this.selectedItems.length) return;
    for (const item of this.selectedItems) {
      if ('data' in item) {
        await this.deleteDocument(item.id);
      } else {
        await this.deleteFolder(item.id);
      }
    }
    this.cancelMultiSelect();
  }

  async loadDocumentsAndFolders() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const [documents, folders] = await Promise.all([
        this.documentService.getDocuments({
          groupBy: this.groupBy,
          orderBy: this.orderBy
        }),
        this.documentService.getFolders()
      ]);
      this.documents = documents.filter(d => d.parentFolderId === this.currentParentFolder?.id);
      this.folders = folders.filter(f => f.parentFolderId === this.currentParentFolder?.id);
    } catch {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  async navigateToPath(segment: IPathSegmenmat): Promise<void> {
    if (!segment.id) {
      this.currentParentFolder = undefined;
      this.currentPath = '[]';
    } else {
      const folder = await this.documentService.getFolders().then(folders =>
        folders.find(f => f.id === segment.id)
      );
      this.currentParentFolder = folder;
      this.currentPath = folder?.relativePath || '[]';
    }
    this.updatePathSegments();
    this.loadDocumentsAndFolders();
  }

  updatePathSegments(): void {
    const parsedPath = JSON.parse(this.currentPath || '[]') as { name: string, id: string }[];
    this.pathSegments = [{ name: 'Root', id: undefined }];
    this.pathSegments.push(...parsedPath.map(segment => ({
      name: segment.name,
      id: segment.id
    })));
  }

  async addNewFile(): Promise<void> {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh',
      data: {
        parentFolderId: this.currentParentFolder?.id,
        isDesktop: this.appService.isDesktop,
        isTablet: this.appService.isTablet,
        isMobile: this.appService.isMobile
      }
    });
    dialogRef.afterClosed().subscribe(async (doc: Document | undefined) => {
      if (doc) {
        try {
          await this.documentService.saveNewDocuments(doc);
          await this.loadDocumentsAndFolders();
        } catch {
          this.errorMessage = 'Failed to add file.';
        }
      }
    });
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

  async deleteFolder(id: string, event?: MouseEvent): Promise<void> {
    event?.stopPropagation();
    this.loading = true;
    try {
      await this.documentService.deleteFolder(id);
      this.folders = this.folders.filter(f => f.id !== id);
    } catch {
      this.errorMessage = 'Failed to delete folder.';
    }
    this.loading = false;
  }

  async loadFolders(): Promise<Folder[]> {
    return this.documentService.getFolders();
  }

  async createFolder(): Promise<void> {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh'
    });
    dialogRef.afterClosed().subscribe(async (name: string | undefined) => {
      if (name) {
        try {
          await this.documentService.createFolder(name, this.currentParentFolder);
          await this.loadDocumentsAndFolders();
        } catch {
          this.errorMessage = 'Failed to create folder.';
        }
      }
    });
  }
}