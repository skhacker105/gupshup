import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Contact } from '../../../../models';
import { ChatService, ContactService } from '../../../../services';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  contacts: Contact[] = [];
  isMobile = false;
  isTablet = false;
  isDesktop = true;

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
    this.contacts = await this.contactService.getContacts();
  }

  async syncContacts(): Promise<void> {
    await this.chatService.syncContacts();
    this.contacts = await this.contactService.getContacts();
  }

  openGroupCreate(): void {
    this.dialog.open(GroupCreateComponent);
  }

  openChat(contact: Contact): void {
    this.router.navigate(['/chat', contact.id]);
  }
}