// src/app/components/docs-list/docs-list.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { Folder, Document, IconSize, IPathSegmenmat } from '../../../../models';
import { AppService, DocumentService } from '../../../../services';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { ActivatedRoute, Router } from '@angular/router';

type Item = Document | Folder;

interface IGroup {
  groupKey: string;
  documents: Document[];
}

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  items: Item[] = [];
  groups: IGroup[] = [];
  selectedItems: Item[] = [];
  selectedGroups: string[] = [];
  multiSelectMode = false;

  loading = false;
  errorMessage = '';

  currentFolder: Folder | undefined = undefined; // Root level
  currentPath: string = '[]'; // Current relative path (JSON string)
  pathSegments: IPathSegmenmat[] = [{ name: 'Root', id: undefined }]; // For breadcrumb
  iconSizes = Object.values(IconSize);
  
  get isMarkForBackupDisabled(): boolean {
    return this.selectedItems.length === 0 || this.selectedItems.every(item => this.isFolder(item) || (item as Document).backupAccountId);
  }

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

  isFolder(item: Item): item is Folder {
    return !('data' in item); // Discriminator: Documents have 'data: Blob'
  }

  rowClick(item: Item, event: MouseEvent): void {
    if (this.multiSelectMode) {
      // if (!this.isFolder(item))
      this.toggleSelect(item, event);
      if (this.documentService.selectedGroupBy) {
        const parentGroup = this.groups.find(g => g.documents.some(d => d.id === item.id));
        if (parentGroup) {
          const allSelected = parentGroup.documents.every(d => this.isSelected(d));
          if (allSelected && !this.isGroupSelected(parentGroup.groupKey)) {
            this.selectedGroups.push(parentGroup.groupKey);
          } else if (!allSelected && this.isGroupSelected(parentGroup.groupKey)) {
            this.selectedGroups = this.selectedGroups.filter(g => g !== parentGroup.groupKey);
          }
        }
      }
    } else {
      if (this.isFolder(item)) { // Folder
        this.router.navigate(['/docs', item.id]);
      } else {
        // Open document
        this.documentService.openDocument(item);
      }
    }
  }

  isGroupSelected(groupKey: string): boolean {
    return this.selectedGroups.includes(groupKey);
  }

  onGroupRadioClick(group: IGroup, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isGroupSelected(group.groupKey)) {
      this.selectedGroups = this.selectedGroups.filter(g => g !== group.groupKey);
      this.selectedItems = this.selectedItems.filter(
        item => !this.isFolder(item) && !group.documents.includes(item)
      );
    } else {
      this.selectedGroups.push(group.groupKey);
      for (const doc of group.documents) {
        if (!this.isSelected(doc)) {
          this.selectedItems.push(doc);
        }
      }
    }
    this.multiSelectMode = this.selectedItems.length > 0 || this.selectedGroups.length > 0;
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
    this.selectedGroups = [];
    this.multiSelectMode = false;
  }

  async deleteSelected(): Promise<void> {
    if (!this.selectedItems.length) return;

    const isAnyFolderSelected = this.selectedItems.some(item => this.isFolder(item));
    const selectNames = this.selectedItems.map(item => item.name).join(', ');
    const confirmationMessage = selectNames + (isAnyFolderSelected ? ' and all sub folders and files' : '');
    const confirmToDelete = await this.appService.confirmForDelete(confirmationMessage);
    if (!confirmToDelete) return;

    for (const item of this.selectedItems) {
      if (!this.isFolder(item)) {
        await this.deleteDocument(item.id);
      } else {
        await this.deleteFolder(item);
      }
    }
    this.cancelMultiSelect();
    await this.loadItems();
  }

  async markSelectedForBackup(): Promise<void> {
    if (!this.selectedItems.length) return;

    // Filter only documents (skip folders)
    const selectedDocuments = this.selectedItems.filter(item => !this.isFolder(item)) as Document[];

    if (!selectedDocuments.length) {
      this.errorMessage = 'No documents selected for backup.';
      return;
    }

    const confirmationMessage = `Mark the following documents for backup: ${selectedDocuments.map(doc => doc.name).join(', ')}?`;
    const subInfo = 'Only selected documents not having backup will be sent for backup.';
    const confirmToBackup = await this.appService.confirmForBackup(confirmationMessage, subInfo);
    if (!confirmToBackup) return;

    this.loading = true;
    try {
      for (const doc of selectedDocuments) {
        if (!doc.backupAccountId) {
          // Placeholder for marking backup - call service if available
          console.log('Marking for backup:', doc.id);
          // TODO: Implement actual backup marking, e.g., this.documentService.markForBackup(doc.id);
          // For demo, simulate marking
          doc.backupAccountId = 'simulated-backup-id'; // Update locally for UI refresh
        }
      }
      this.cancelMultiSelect();
      await this.loadItems(); // Refresh to reflect changes
    } catch (err) {
      this.errorMessage = 'Failed to mark documents for backup.';
    }
    this.loading = false;
  }

  async markForBackup(item: Item) {
    if (this.isFolder(item)) return;

    const confirmationMessage = `Mark the following documents for backup: ${item.name}?`;
    const confirmToBackup = await this.appService.confirmForBackup(confirmationMessage);
    if (!confirmToBackup) return;
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
    dialogRef.afterClosed().subscribe(async (docs: Document[] | undefined) => {
      this.loading = true;
      if (docs) {
        try {
          for (let i=0; i < docs.length; i++) {
            await this.documentService.saveNewDocuments(docs[i], this.currentFolder)
          }
          // await docs.map(async (d) => await this.documentService.saveNewDocuments(d, this.currentFolder));
          // await this.documentService.saveNewDocuments(doc, this.currentFolder);
          await this.loadItems();
        } catch {
          this.errorMessage = 'Failed to add file.';
          this.loading = false;
        }
      }
      this.loading = false;
    });
  }

  async deleteDocument(id: string, event?: MouseEvent): Promise<void> {
    event?.stopPropagation();
    this.loading = true;
    try {
      await this.documentService.deleteDocument(id);
      await this.loadItems();
    } catch {
      this.errorMessage = 'Failed to delete document.';
    }
    this.loading = false;
  }

  async collectAllSubItems(folder: Folder) {
    let items: Item[] = [];
    try {
      const [documents, folders] = await Promise.all([
        this.documentService.getDocuments(folder.id),
        this.documentService.getFolders(folder?.id)
      ]);
      items = [...items, ...documents, ...folders];
      for (let f of folders) {
        const childItems = await this.collectAllSubItems(f);
        items = items.concat(childItems);
      }
    } catch (err) { }
    return items;
  }

  async deleteFolder(folder?: Folder, event?: MouseEvent): Promise<void> {
    event?.stopPropagation();

    if (!folder) return;

    const isCurrentFolder = folder.id === this.currentFolder?.id;
    if (isCurrentFolder) {
      const confirmationMessage = `${folder.name} and all sub folders and files`
      const confirmToDelete = await this.appService.confirmForDelete(confirmationMessage)
      if (!confirmToDelete) return;
    }

    const subItems = await this.collectAllSubItems(folder);
    this.loading = true;
    try {
      const deletePromise = subItems.map(sitem => {
        return this.isFolder(sitem)
          ? this.documentService.deleteFolder(sitem.id)
          : this.documentService.deleteDocument(sitem.id)
      }).concat([this.documentService.deleteFolder(folder.id)]);
      if (deletePromise.length > 0)
        await Promise.all(deletePromise);

      if (isCurrentFolder) {
        this.navigateToPath({ name: folder.name, id: folder.parentFolderId })
        this.router.navigate(['/docs', folder.parentFolderId]);
      } else {
        await this.loadItems();
      }
    } catch {
      this.errorMessage = 'Failed to delete folder.';
    }
    this.loading = false;
  }

  async createFolder(): Promise<void> {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh',
      data: {
        isDesktop: this.appService.isDesktop,
        isTablet: this.appService.isTablet,
        isMobile: this.appService.isMobile
      }
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