import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FolderCreateComponent } from '../folder-create/folder-create.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DocumentService } from '../../../../services';
import { Document } from '../../../../models';

@Component({
  selector: 'app-docs-list',
  templateUrl: './docs-list.component.html',
  styleUrls: ['./docs-list.component.scss']
})
export class DocsListComponent implements OnInit {
  documents: Document[] = [];
  groupBy = '';
  orderBy = '';
  loading = false;
  errorMessage = '';
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private documentService: DocumentService,
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
    this.loading = true;
    this.errorMessage = '';
    try {
      this.documents = await this.documentService.getDocuments({ groupBy: this.groupBy, orderBy: this.orderBy });
    } catch (err) {
      this.errorMessage = 'Failed to load documents.';
    }
    this.loading = false;
  }

  async deleteDocument(id: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.documentService.deleteDocument(id, false);
      this.documents = this.documents.filter(doc => doc.id !== id);
      this.errorMessage = 'Document deleted successfully.';
    } catch (err) {
      this.errorMessage = 'Failed to delete document.';
    }
    this.loading = false;
  }

  async createFolder(): Promise<void> {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: this.isMobile ? '90%' : this.isTablet ? '70%' : '500px',
      maxHeight: this.isMobile ? '80vh' : '70vh'
    });
    dialogRef.afterClosed().subscribe(async (name: string | undefined) => {
      if (name) {
        this.loading = true;
        this.errorMessage = '';
        try {
          await this.documentService.createFolder(name);
          this.errorMessage = 'Folder created successfully.';
          await this.loadDocuments();
        } catch (err) {
          this.errorMessage = 'Failed to create folder.';
        }
        this.loading = false;
      }
    });
  }

  getGroupKey(doc: Document): string {
    switch (this.groupBy) {
      case 'type':
        return doc.type || 'unknown';
      case 'month':
        return doc.createdDate ? new Date(doc.createdDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'unknown';
      case 'sender':
        return doc.senderId || 'unknown';
      case 'receiver':
        return doc.receiverId || 'unknown';
      default:
        return '';
    }
  }
}