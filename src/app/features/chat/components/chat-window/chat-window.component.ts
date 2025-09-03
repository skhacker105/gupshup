// src/app/features/chat/components/chat-window/chat-window.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MediaEditorComponent } from '../media-editor/media-editor.component';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Contact, Message, Document } from '../../../../models';
import { AppService, ChatService, DbService, DocumentService, TranslationService } from '../../../../services';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: Message = { id: '', senderId: '', receiverId: '', createdAt: new Date() };
  currentUserId = 'current-user-id';
  receiverId = '';
  receiverName = '';
  sub!: Subscription;
  selectedFile?: File;
  loading = false;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private chatService: ChatService,
    private translationService: TranslationService,
    private documentService: DocumentService,
    private dbService: DbService,
    private dialog: MatDialog,
    public appService: AppService
  ) {
    
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.receiverId = this.route.snapshot.paramMap.get('id') || '';
    this.newMessage.receiverId = this.receiverId;
    this.newMessage.senderId = this.currentUserId;
    try {
      const all = await this.chatService.getAllMessageByUser(this.receiverId);
      this.messages = all
        .filter((m: Message) => m.receiverId === this.receiverId || m.senderId === this.receiverId)
        .sort((a: Message, b: Message) => b.createdAt.getTime() - a.createdAt.getTime());
      const contacts = await this.dbService.getAll('contacts');
      const contact = contacts.find((c: Contact) => c.id === this.receiverId);
      this.receiverName = contact?.name || this.receiverId;
      this.sub = this.chatService.getMessages().subscribe(msg => {
        if (msg.receiverId === this.receiverId || msg.senderId === this.receiverId) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      });
    } catch (err) {
      this.errorMessage = 'Failed to load messages.';
    }
    this.loading = false;
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.text && !this.selectedFile) {
      this.errorMessage = 'Please enter a message or select a file.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.newMessage.id = uuidv4();
    this.newMessage.createdAt = new Date();
    try {
      if (this.selectedFile) {
        const dialogRef = this.dialog.open(MediaEditorComponent, {
          width: this.appService.isMobile ? '90%' : this.appService.isTablet ? '70%' : '500px',
          maxHeight: this.appService.isMobile ? '80vh' : '70vh',
          data: { file: this.selectedFile }
        });
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
              // expiryDate: await this.documentService.calculateExpiryDate(editedFile.type)
            };
            await this.documentService.saveNewDocuments(doc);
            this.newMessage.file = doc;
          }
          await this.chatService.sendMessage(this.newMessage);
          this.chatService.sendMessage(this.newMessage);
          this.newMessage.text = '';
          this.selectedFile = undefined;
          this.scrollToBottom();
        });
      } else {
        await this.chatService.sendMessage(this.newMessage);
        this.chatService.sendMessage(this.newMessage);
        this.newMessage.text = '';
        this.scrollToBottom();
      }
    } catch (err) {
      this.errorMessage = 'Failed to send message.';
    }
    this.loading = false;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async translateMessage(msg: Message): Promise<void> {
    if (msg.text && !msg.translatedText) {
      try {
        const user = await this.dbService.getUser();
        msg.translatedText = await this.translationService.translate(msg.text, 'auto', user.targetLanguage);
      } catch (err) {
        this.errorMessage = 'Translation failed.';
      }
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
      this.errorMessage = 'Invalid document.';
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
        this.errorMessage = 'Document not found.';
      }
    }).catch(err => {
      this.errorMessage = 'Error downloading document.';
    });
  }

  showInfo(): void {
    alert(`Chatting with ${this.receiverName}\nID: ${this.receiverId}`);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 0);
  }
}