import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DbService, DocumentService, StorageAccountService } from '../../../../services';
import { Document } from '../../../../models';

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  documents: Document[] = [];
  groupBy = 'date';
  orderBy = 'date';
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private documentService: DocumentService,
    private dbService: DbService,
    private storageService: StorageAccountService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadDocuments();
  }

  async loadDocuments(): Promise<void> {
    this.documents = await this.documentService.getDocuments({ groupBy: this.groupBy, orderBy: this.orderBy });
  }

  applyFilters(): void {
    this.loadDocuments();
  }

  async backup(doc: Document): Promise<void> {
    const accounts = await this.storageService.getAccounts().toPromise();
    if (!accounts) {
      console.error('No accounts present for backup');
      return;
    }
    const accountId = accounts[0]?.id;
    if (accountId) {
      await this.documentService.backupDocument(doc, accountId);
      this.loadDocuments();
    } else {
      alert('No storage account available');
    }
  }

  async deleteDoc(id: string, permanent: boolean): Promise<void> {
    await this.documentService.deleteDocument(id, permanent);
    this.loadDocuments();
  }

  createFolder(): void {
    this.dialog.open(FolderCreateComponent).afterClosed().subscribe(() => this.loadDocuments());
  }

  async moveToFolder(doc: Document): Promise<void> {
    const folders = await this.dbService.getFolders();
    const dialogRef = this.dialog.open(FolderSelectDialogComponent, {
      data: { folders }
    });
    dialogRef.afterClosed().subscribe(async (folderId: string | undefined) => {
      if (folderId) {
        doc.folderId = folderId;
        await this.dbService.storeDocument(doc);
        this.loadDocuments();
      }
    });
  }
}

@Component({
  selector: 'app-folder-select-dialog',
  template: `
    <mat-dialog-content class="folder-select-wrapper" [ngClass]="{'mobile': isMobile, 'tablet': isTablet, 'desktop': isDesktop}">
      <h2><i class="fa fa-folder"></i> Select Folder</h2>
      <select [(ngModel)]="selectedFolderId">
        <option *ngFor="let folder of folders" [value]="folder.id">{{ folder.name }}</option>
      </select>
      <button (click)="select()"><i class="fa fa-check"></i> Select</button>
      <button mat-dialog-close><i class="fa fa-times"></i> Cancel</button>
    </mat-dialog-content>
  `,
  styles: [`
    .folder-select-wrapper {
      &.mobile { font-size: 0.875rem; }
      &.tablet { padding: 1rem; }
      select { width: 100%; margin-bottom: 1rem; }
      button { margin-right: 1rem; }
    }
  `]
})
export class FolderSelectDialogComponent {
  folders: { id: string; name: string }[];
  selectedFolderId?: string;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { folders: { id: string; name: string }[] },
    private dialogRef: MatDialogRef<FolderSelectDialogComponent>,
    private breakpointObserver: BreakpointObserver
  ) {
    this.folders = data.folders;
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  select(): void {
    this.dialogRef.close(this.selectedFolderId);
  }
}