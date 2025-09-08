import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../../models';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default values for optional parameters
    this.data = {
      title: data.title ?? 'Confirmation',
      message: data.message,
      okButtonText: data.okButtonText ?? 'OK',
      cancelButtonText: data.cancelButtonText ?? 'Cancel',
      subInfo: data.subInfo ?? '',
      isDesktop: data.isDesktop,
      isTablet: data.isTablet,
      isMobile: data.isMobile
    };
  }
}
