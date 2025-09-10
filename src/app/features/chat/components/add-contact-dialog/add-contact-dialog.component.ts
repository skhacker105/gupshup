import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '../../../../models';
import { AppService, AuthService, ContactService } from '../../../../services';

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
    public appService: AppService,
    private authService: AuthService,
    private contactService: ContactService
  ) {

  }

  sanitizeInput() {
    this.contact.id = this.contact.id.trim();
    this.contact.name = this.contact.name.trim();
    this.contact.phoneNumber = this.contact.phoneNumber.trim();
  }

  async newContactVerified() {

    // Name and phone number are required.
    if (!this.contact.name || !this.contact.phoneNumber) {
      this.errorMessage = 'Name and phone number are required.';
      return false;
    }

    // You cannot use you own phone number.
    const loggedInUser = await this.authService.getLoggedInUserInfo();
    if (loggedInUser?.phoneNumber === this.contact.phoneNumber) {
      this.errorMessage = 'You cannot use you own phone number.';
      return false;
    }

    const contactByNumber = await this.contactService.getContactByPhone(this.contact.phoneNumber);
    if (contactByNumber.length > 0) {
      this.errorMessage = 'Phone number already exists.';
      return false;
    }

    const contactByName = await this.contactService.getContactByName(this.contact.name);
    const existingContact = contactByName.find(c => c.phoneNumber === this.contact.phoneNumber || c.name === this.contact.name);
    if (existingContact) {
      this.errorMessage = 'Contact name already exists.';
      return false;
    }

    return true;
  }

  async addContact(): Promise<void> {
    this.sanitizeInput();
    if (!await this.newContactVerified()) return;

    this.loading = true;
    this.errorMessage = '';
    try {
      this.contact.id = uuidv4();
      this.dialogRef.close(this.contact);
    } catch (err) {
      this.errorMessage = 'Failed to add contact.';
    }
    this.loading = false;
  }
}