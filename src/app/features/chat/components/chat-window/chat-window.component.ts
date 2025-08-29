import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MediaEditorComponent } from '../media-editor/media-editor.component';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Contact, Message, Document } from '../../../../models';
import { ChatService, DbService, DocumentService, TranslationService } from '../../../../services';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: Message = { id: '', senderId: '', receiverId: '', createdAt: new Date() };
  currentUserId = 'current-user-id'; // Replace with auth service
  receiverId = '';
  receiverName = '';
  sub!: Subscription;
  selectedFile?: File;
  loading = false;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private translationService: TranslationService,
    private documentService: DocumentService,
    private dbService: DbService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  async ngOnInit(): Promise<void> {
    this.receiverId = this.route.snapshot.paramMap.get('id') || '';
    this.newMessage.receiverId = this.receiverId;
    this.newMessage.senderId = this.currentUserId;
    const all = await this.dbService.getMessagesForReceiver(this.receiverId);
    this.messages = all
      .filter((m: Message) => m.receiverId === this.receiverId || m.senderId === this.receiverId)
      .sort((a: Message, b: Message) => b.createdAt.getTime() - a.createdAt.getTime());
    this.scrollToBottom();
    this.sub = this.chatService.getMessages().subscribe(msg => {
      if (msg.receiverId === this.receiverId || msg.senderId === this.receiverId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
    const contacts = await this.dbService.getAll('contacts');
    const contact = contacts.find((c: Contact) => c.id === this.receiverId);
    this.receiverName = contact?.name || this.receiverId;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async sendMessage(): Promise<void> {
    this.loading = true;
    this.newMessage.id = uuidv4();
    this.newMessage.createdAt = new Date();
    if (this.selectedFile) {
      const dialogRef = this.dialog.open(MediaEditorComponent, { data: { file: this.selectedFile } });
      dialogRef.afterClosed().subscribe(async (editedFile: File | undefined) => {
        if (editedFile) {
          const doc: Document = {
            id: uuidv4(),
            name: editedFile.name,
            type: editedFile.type,
            data: editedFile as Blob,
            senderId: this.currentUserId,
            receiverId: this.receiverId,
            createdDate: new Date(),
            expiryDate: await this.calculateExpiryDate(editedFile.type)
          };
          await this.dbService.storeDocument(doc);
          this.newMessage.file = doc;
        }
        await this.dbService.storeMessage(this.newMessage);
        this.chatService.sendMessage(this.newMessage);
        this.newMessage.text = '';
        this.selectedFile = undefined;
        this.loading = false;
        this.scrollToBottom();
      });
    } else {
      await this.dbService.storeMessage(this.newMessage);
      this.chatService.sendMessage(this.newMessage);
      this.newMessage.text = '';
      this.loading = false;
      this.scrollToBottom();
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async translateMessage(msg: Message): Promise<void> {
    if (msg.text && !msg.translatedText) {
      const user = await this.dbService.getUser();
      msg.translatedText = await this.translationService.translate(msg.text, 'auto', user.targetLanguage);
    }
  }

  getFileUrl(file: Document): string {
    return URL.createObjectURL(file.data);
  }

  async getContactNameForMessage(msg: Message): Promise<string> {
    const contacts = await this.dbService.getAll('contacts');
    const contact = contacts.find((c: Contact) => c.id === msg.senderId);
    return contact?.name || msg.senderId;
  }

  downloadAttachment(id?: string, name?: string): void {
    if (!id || !name) {
      console.error('Invalid document ID or name');
      return;
    }
    this.dbService.get('documents', id).then((doc: Document) => {
      if (doc) {
        const url = URL.createObjectURL(doc.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        console.error('Document not found');
      }
    }).catch(err => console.error('Error downloading document:', err));
  }

  showInfo(): void {
    alert(`Chatting with ${this.receiverName}`);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 0);
  }

  private async calculateExpiryDate(fileType: string): Promise<Date | undefined> {
    const user = await this.dbService.getUser();
    const settings = user.expirationSettings || { defaultPeriod: '1week', typeExpirations: {} };
    const period = settings.typeExpirations[fileType.split('/')[0]] || settings.defaultPeriod;
    const now = new Date();
    switch (period) {
      case '1week':
        return new Date(now.setDate(now.getDate() + 7));
      case '1month':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'immediate':
        return new Date(now.getTime() + 60000);
      default:
        return undefined;
    }
  }
}