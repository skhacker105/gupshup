import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DocumentService } from '../../../../services';

@Component({
  selector: 'app-folder-create',
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.scss']
})
export class FolderCreateComponent {
  name = '';
  errorMessage = '';
  loading = false;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private dialogRef: MatDialogRef<FolderCreateComponent>,
    private documentService: DocumentService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  async createFolder(): Promise<void> {
    if (!this.name) {
      this.errorMessage = 'Folder name is required.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.documentService.createFolder(this.name);
      this.dialogRef.close(this.name);
    } catch (err) {
      this.errorMessage = 'Failed to create folder.';
    }
    this.loading = false;
  }
}