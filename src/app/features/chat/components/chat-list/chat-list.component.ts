// src/app/features/chat/components/chat-list/chat-list.component.ts
import { Component, OnInit } from '@angular/core';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Contact, ContactGroup } from '../../../../models';
import { ChatService, ContactService } from '../../../../services';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  contacts: Contact[] = [];
  groups: ContactGroup[] = [];
  isMobile = false;
  isTablet = false;
  isDesktop = true;
  loading = false;
  errorMessage = '';

  constructor(
    private chatService: ChatService,
    private contactService: ContactService,
    private dialog: MatDialog,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
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

  async syncContacts(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.chatService.syncContacts();
      this.contacts = await this.contactService.getContacts();
      this.groups = await this.contactService.getAll('contactGroups');
      this.errorMessage = 'Contacts synced successfully.';
    } catch (err) {
      this.errorMessage = 'Failed to sync contacts.';
    }
    this.loading = false;
  }

  openGroupCreate(): void {
    this.dialog.open(GroupCreateComponent, {
      width: this.isMobile ? '90%' : this.isTablet ? '70%' : '500px',
      maxHeight: this.isMobile ? '80vh' : '70vh'
    });
  }

  openChat(id: string): void {
    this.router.navigate(['/chat', id]);
  }
}