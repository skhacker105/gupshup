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

  mergedList: any[] = [];
  selectedItems: any[] = [];
  multiSelectMode = false;


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
      this.mergeLists();
    } catch {
      this.errorMessage = 'Failed to load contacts or groups.';
    }
    this.loading = false;
  }

  mergeLists(orderBy: 'name' | 'lastMessageDate' = 'name'): void {
    this.mergedList = [
      ...this.contacts.map(c => ({ ...c, type: 'contact' })),
      ...this.groups.map(g => ({ ...g, type: 'group' }))
    ].sort((a, b) => {
      if (orderBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const aTime = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const bTime = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return bTime - aTime; // latest first
      }
    });
  }

  toggleSelect(item: any, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter(i => i !== item);
    } else {
      this.selectedItems.push(item);
    }
    this.multiSelectMode = this.selectedItems.length > 0;
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  cancelMultiSelect(): void {
    this.selectedItems = [];
    this.multiSelectMode = false;
  }

  deleteSelected(): void {
    // implement delete logic (contacts + groups)
    this.cancelMultiSelect();
  }

  openChat(item: any, event: MouseEvent): void {
    event.stopPropagation();
    // navigate to chat
  }

  deleteItem(item: any, event: MouseEvent): void {
    event.stopPropagation();
    // delete single contact/group
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