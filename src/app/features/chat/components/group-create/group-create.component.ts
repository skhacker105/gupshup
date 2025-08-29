import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { Contact, ContactGroup } from '../../../../models';
import { ContactService } from '../../../../services';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.scss']
})
export class GroupCreateComponent implements OnInit {
  group: ContactGroup = { id: uuidv4(), name: '', members: [] };
  contacts: Contact[] = [];

  constructor(
    private dialogRef: MatDialogRef<GroupCreateComponent>,
    private contactService: ContactService
  ) { }

  ngOnInit() {
    this.contactService.getContacts().then(c => this.contacts = c);
  }

  createGroup() {
    this.contactService.createGroup(this.group).then(() => this.dialogRef.close());
  }
}