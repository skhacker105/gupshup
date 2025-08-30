import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Contact } from '../../../../models';

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.scss']
})
export class AddContactDialogComponent {
  contact: Contact = { id: '', name: '', phoneNumber: '', online: false };
  errorMessage = '';
  loading = false;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private dialogRef: MatDialogRef<AddContactDialogComponent>,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
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