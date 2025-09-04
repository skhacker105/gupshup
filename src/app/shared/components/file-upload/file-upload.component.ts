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
  selectedFiles: File[] = [];
  errorMessage = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<FileUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parentFolderId?: string, isDesktop: boolean, isTablet: boolean, isMobile: boolean }
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      if (this.selectedFiles.length === 1 && !this.name) {
        this.name = this.selectedFiles[0].name;
      } else {
        this.name = ''; // Clear name for multiple files
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 1) {
      this.name = this.selectedFiles[0].name;
    } else {
      this.name = '';
    }
  }

  async uploadFile(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Please select at least one file.';
      return;
    }
    if (this.selectedFiles.length === 1 && !this.name) {
      this.errorMessage = 'File name is required for single file upload.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      const documents: Document[] = this.selectedFiles.map((file, index) => ({
        id: uuidv4(),
        name: this.selectedFiles.length === 1 ? this.name : `${file.name}`,
        type: file.type,
        data: file,
        senderId: '',
        receiverId: '',
        createdDate: new Date(),
        parentFolderId: this.data.parentFolderId,
      }));
      this.dialogRef.close(documents);
    } catch (err) {
      this.errorMessage = 'Failed to upload files.';
    }
    this.loading = false;
  }
}