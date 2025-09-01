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

  currentParentId: string | undefined = undefined; // Root level
  currentPath: string = '/'; // Current relative path
  pathSegments: IPathSegmenmat[] = [{ name: 'Root', id: '' }]; // For breadcrumb
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
        this.currentParentId = item.id;
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
      this.documents = documents.filter(d => d.parentFolderId === this.currentParentId);
      this.folders = folders.filter(f => f.parentFolderId === this.currentParentId);
      console.log('this.documents = ', this.documents);
      console.log('this.folders = ', this.folders);
    } catch {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  async navigateToPath(segment: { name: string, id?: string }): Promise<void> {
    this.currentParentId = segment.id;
    if (segment.id) {
      const folder = await this.documentService.getFolders().then(folders =>
        folders.find(f => f.id === segment.id)
      );
      this.currentPath = folder?.relativePath || '/';
    } else {
      this.currentPath = '/';
    }
    this.updatePathSegments();
    this.loadDocumentsAndFolders();
  }

  updatePathSegments(): void {
    const segments = this.currentPath.split('/').filter(segment => segment);
    this.pathSegments = [{ name: 'Root', id: undefined }];
    let currentId: string | undefined = undefined;
    let pathSoFar = '';
    for (const segment of segments) {
      pathSoFar += `/${segment}`;
      // Find folder ID for this segment (simplified; in practice, may need async lookup)
      const folder = this.folders.find(f => f.relativePath === pathSoFar);
      this.pathSegments.push({ name: segment, id: folder?.id });
      currentId = folder?.id;
    }
  }

  loadDocuments(): Promise<Document[]> {
    return this.documentService.getDocuments({
      groupBy: this.groupBy,
      orderBy: this.orderBy
    });
  }

  async addNewFile(): Promise<void> {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh',
      data: { parentFolderId: this.currentParentId }
    });
    dialogRef.afterClosed().subscribe(async (doc: Document | undefined) => {
      if (doc) {
        try {
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
    console.log('\ncreateFolder start')
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh'
    });
    dialogRef.afterClosed().subscribe(async (name: string | undefined) => {
      if (name) {
        console.log('createFolder by name = ', name)
        try {
          await this.documentService.createFolder(name, this.currentParentId);
          await this.loadDocumentsAndFolders();
        } catch {
          this.errorMessage = 'Failed to create folder.';
        }
      }
    });
  }
}