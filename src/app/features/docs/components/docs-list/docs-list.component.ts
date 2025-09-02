// src/app/components/docs-list/docs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { Folder, Document, IconSize, IPathSegmenmat } from '../../../../models';
import { AppService, DocumentService } from '../../../../services';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { ActivatedRoute, Router } from '@angular/router';

type Item = Document | Folder;

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  items: Item[] = [];
  groups: { groupKey: string, documents: Document[] }[] = [];
  selectedItems: Item[] = [];
  multiSelectMode = false;

  // groupBy = '';
  // orderBy = '';
  loading = false;
  errorMessage = '';

  currentFolder: Folder | undefined = undefined; // Root level
  currentPath: string = '[]'; // Current relative path (JSON string)
  pathSegments: IPathSegmenmat[] = [{ name: 'Root', id: undefined }]; // For breadcrumb
  iconSizes = Object.values(IconSize);

  constructor(
    public documentService: DocumentService,
    private dialog: MatDialog,
    public appService: AppService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.loadAndProcessFolder(params.get('folderId') ?? undefined)
    })
  }

  async loadAndProcessFolder(parentFolderId?: string) {
    if (!parentFolderId) {
      this.currentFolder = undefined;
      this.currentPath = '[]';
    } else {
      this.currentFolder = await this.documentService.getFolder(parentFolderId);
      this.currentPath = this.currentFolder?.relativePath ?? '[]';
    }
    this.updatePathSegments();
    this.loadItems();
  }

  enableMobileMultiSelect(): void {
    this.multiSelectMode = true;
  }

  isFolder(item: Item): boolean {
    return !('data' in item); // Discriminator: Documents have 'data: Blob'
  }

  rowClick(item: Item, event: MouseEvent): void {
    if (this.multiSelectMode) {
      if (!this.isFolder(item))
        this.toggleSelect(item, event);
    } else {
      if (this.isFolder(item)) { // Folder
        this.router.navigate(['/docs', item.id]);
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
    await this.loadItems();
  }

  async loadItems() {
    this.loading = true;
    this.errorMessage = '';
    try {
      if (this.documentService.selectedGroupBy) {
        this.groups = await this.documentService.getGroupedDocuments(this.documentService.selectedGroupBy, this.documentService.selectedOrderBy);
        this.items = [];
      } else {
        const [documents, folders] = await Promise.all([
          this.documentService.getDocuments(this.currentFolder?.id),
          this.documentService.getFolders(this.currentFolder?.id)
        ]);
        this.items = [...folders, ...documents];
        if (this.documentService.selectedOrderBy) {
          this.items = this.items.sort(this.sortItems.bind(this));
        }
        this.groups = [];
      }
    } catch (err) {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  sortItems(a: Item, b: Item): number {
    switch (this.documentService.selectedOrderBy) {
      case 'createdDate':
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'senderId':
        const aSender = 'senderId' in a ? a.senderId : '';
        const bSender = 'senderId' in b ? b.senderId : '';
        return aSender.localeCompare(bSender);
      case 'receiverId':
        const aReceiver = 'receiverId' in a ? a.receiverId : '';
        const bReceiver = 'receiverId' in b ? b.receiverId : '';
        return aReceiver.localeCompare(bReceiver);
      default:
        return 0;
    }
  }

  async navigateToPath(segment: IPathSegmenmat): Promise<void> {
    if (segment.id)
      this.router.navigate(['/docs', segment.id]);
    else
      this.router.navigateByUrl('/docs');
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
        parentFolderId: this.currentFolder?.id,
        isDesktop: this.appService.isDesktop,
        isTablet: this.appService.isTablet,
        isMobile: this.appService.isMobile
      }
    });
    dialogRef.afterClosed().subscribe(async (doc: Document | undefined) => {
      if (doc) {
        try {
          await this.documentService.saveNewDocuments(doc, this.currentFolder);
          await this.loadItems();
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
      await this.loadItems();
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
      await this.loadItems();
    } catch {
      this.errorMessage = 'Failed to delete folder.';
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
          await this.documentService.createFolder(name, this.currentFolder);
          await this.loadItems();
        } catch {
          this.errorMessage = 'Failed to create folder.';
        }
      }
    });
  }
}