import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentService } from '../../../../services';

@Component({
  selector: 'app-folder-create',
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.scss']
})
export class FolderCreateComponent {
  name = '';

  constructor(
    private dialogRef: MatDialogRef<FolderCreateComponent>,
    private documentService: DocumentService
  ) { }

  create() {
    this.documentService.createFolder(this.name).then(() => this.dialogRef.close());
  }
}