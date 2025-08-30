import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AddContactDialogComponent } from '../add-contact-dialog/add-contact-dialog.component';
import { Contact, ContactGroup } from '../../../../models';
import { AppService, ContactService } from '../../../../services';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  contacts: Contact[] = [];
  groups: ContactGroup[] = [];
  loading = false;
  errorMessage = '';


  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    public appService: AppService
  ) {
    
  }

  async ngOnInit(): Promise<void> {
    setTimeout(async () => {
      await this.loadData();
    }, 100);
  }

  async loadData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.contacts = await this.contactService.getContacts();
      this.groups = await this.contactService.getAll('contactGroups');
    } catch (err) {
      this.errorMessage = 'Failed to load contacts or groups.';
    }
    this.loading = false;
  }

  async sync(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      // await this.contactService.syncContacts();
      await this.loadData();
      this.errorMessage = 'Contacts synced successfully.';
    } catch (err) {
      this.errorMessage = 'Failed to sync contacts.';
    }
    this.loading = false;
  }

  openAddContactDialog(): void {
    const dialogRef = this.dialog.open(AddContactDialogComponent, {
      width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
      maxHeight: this.appService.isMobile ? '80vh' : '70vh'
    });
    dialogRef.afterClosed().subscribe(async (contact: Contact | undefined) => {
      if (contact) {
        this.loading = true;
        this.errorMessage = '';
        try {
          await this.contactService.storeContact(contact);
          await this.loadData();
          this.errorMessage = 'Contact added successfully.';
        } catch (err) {
          this.errorMessage = 'Failed to add contact.';
        }
        this.loading = false;
      }
    });
  }
}