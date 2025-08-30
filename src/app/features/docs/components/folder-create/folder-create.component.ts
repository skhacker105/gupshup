import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { AppService, DocumentService } from '../../../../services';

@Component({
  selector: 'app-folder-create',
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.scss']
})
export class FolderCreateComponent {
  name = '';
  errorMessage = '';
  loading = false;


  constructor(
    private dialogRef: MatDialogRef<FolderCreateComponent>,
    private documentService: DocumentService,
    public appService: AppService
  ) {
    
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