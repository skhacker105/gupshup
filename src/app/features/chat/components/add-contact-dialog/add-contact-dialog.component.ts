import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { Contact } from '../../../../models';
import { AppService } from '../../../../services';

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.scss']
})
export class AddContactDialogComponent {
  contact: Contact = { id: '', name: '', phoneNumber: '', online: false };
  errorMessage = '';
  loading = false;


  constructor(
    private dialogRef: MatDialogRef<AddContactDialogComponent>,
    public appService: AppService
  ) {
    
  }

  async addContact(): Promise<void> {
    if (!this.contact.name || !this.contact.phoneNumber) {
      this.errorMessage = 'Name and phone number are required.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      this.contact.id = `contact-${Date.now()}`;
      this.dialogRef.close(this.contact);
    } catch (err) {
      this.errorMessage = 'Failed to add contact.';
    }
    this.loading = false;
  }
}