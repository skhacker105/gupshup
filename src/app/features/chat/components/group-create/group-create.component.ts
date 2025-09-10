// src/app/features/chat/components/group-create/group-create.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  existingGroups: ContactGroup[] = [];
  errorMessage = '';
  loading = false;


  constructor(
    public appService: AppService,
    private contactService: ContactService,
    public dialogRef: MatDialogRef<GroupCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contacts: Contact[] }
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.existingGroups = await this.contactService.getGroups();
  }

  newContactVerified(): boolean {
    if (this.data.contacts.length < 2) {
      this.errorMessage = 'Select two or more contacts.';
      return false;
    }

    if (!this.groupName) {
      this.errorMessage = 'Please enter a group name.';
      return false;
    }

    this.groupName = this.groupName.trim();
    const nameIsExisting = this.existingGroups.some(g => g.name === this.groupName);
    if (nameIsExisting) {
      this.errorMessage = `A group with  name '${this.groupName}' already exists.`;
      return false;
    }

    return true;
  }

  async createGroup(): Promise<void> {
    if (!this.newContactVerified()) return;
    
    this.loading = true;
    this.errorMessage = '';
    try {
      
      const group: ContactGroup = {
        id: uuidv4(),
        name: this.groupName,
        members: this.data.contacts.map(c => c.id)
      };
      await this.contactService.createGroup(group);
      this.dialogRef.close(true);

    } catch (err) {
      this.errorMessage = 'Failed to create group.';
    }
    this.loading = false;
  }
}