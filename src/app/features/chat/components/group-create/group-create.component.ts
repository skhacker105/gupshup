// src/app/features/chat/components/group-create/group-create.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';

import { Contact, ContactGroup } from '../../../../models';
import { AppService, ContactService } from '../../../../services';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.scss']
})
export class GroupCreateComponent implements OnInit {
  groupName = '';
  selectedContacts: string[] = [];
  contacts: Contact[] = [];
  errorMessage = '';
  loading = false;


  constructor(
    private dialogRef: MatDialogRef<GroupCreateComponent>,
    private contactService: ContactService,
    public appService: AppService
  ) {
    
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      this.contacts = await this.contactService.getContacts();
    } catch (err) {
      this.errorMessage = 'Failed to load contacts.';
    }
    this.loading = false;
  }

  toggleContact(contactId: string): void {
    const index = this.selectedContacts.indexOf(contactId);
    if (index === -1) {
      this.selectedContacts.push(contactId);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  async createGroup(): Promise<void> {
    if (!this.groupName || this.selectedContacts.length === 0) {
      this.errorMessage = 'Please enter a group name and select at least one contact.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      const group: ContactGroup = {
        id: uuidv4(),
        name: this.groupName,
        members: this.selectedContacts
      };
      await this.contactService.createGroup(group);
      this.dialogRef.close();
    } catch (err) {
      this.errorMessage = 'Failed to create group.';
    }
    this.loading = false;
  }
}