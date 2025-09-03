import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
    @Inject(MAT_DIALOG_DATA) public data: { isDesktop: boolean, isTablet: boolean, isMobile: boolean }
  ) {
    
  }

  async createFolder(): Promise<void> {
    if (!this.name) {
      this.errorMessage = 'Folder name is required.';
      return;
    }
    this.dialogRef.close(this.name);
  }
}