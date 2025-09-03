// src/app/components/file-upload/file-upload.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../../../models';


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  name = '';
  selectedFile: File | null = null;
  errorMessage = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<FileUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parentFolderId?: string, isDesktop: boolean, isTablet: boolean, isMobile: boolean }
  ) {

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      if (!this.name) {
        this.name = this.selectedFile.name;
      }
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.name) {
      this.errorMessage = 'File name is required.';
      return;
    }
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      const doc: Document = {
        id: uuidv4(),
        name: this.name,
        type: this.selectedFile.type,
        data: this.selectedFile,
        senderId: '', // Default or TODO: add input if needed
        receiverId: '', // Default or TODO: add input if needed
        createdDate: new Date(),
        parentFolderId: this.data.parentFolderId,
      };
      this.dialogRef.close(doc);
    } catch (err) {
      this.errorMessage = 'Failed to upload file.';
    }
    this.loading = false;
  }
}