import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TrackByFunction } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Message, Document, Contact, Tables } from '../../../../models';
import { AppService, ChatService, DocumentService, TranslationService, DbService } from '../../../../services';
import { MatDialog } from '@angular/material/dialog';
import { MediaEditorComponent } from '../media-editor/media-editor.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: Message = { id: '', senderId: '', receiverId: '', createdAt: new Date(), status: 'sent' };
  selectedMessages: Message[] = [];
  multiSelectMode = false;
  currentUserId = 'current-user-id';
  receiverId = 'dummy-receiver-id';
  receiverName = 'Dummy Contact';
  selectedFile?: File;
  loading = false;
  errorMessage = '';
  replyingTo: Message | null = null;
  private subscription: Subscription = new Subscription();
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];

  constructor(
    public appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private documentService: DocumentService,
    private translationService: TranslationService,
    private dbService: DbService,
    private dialog: MatDialog
  ) {}

  trackByMessageId: TrackByFunction<Message> = (index: number, msg: Message) => msg.id;

  ngOnInit(): void {
    this.loading = true;
    this.receiverId = this.route.snapshot.paramMap.get('id') || 'dummy-receiver-id';
    this.newMessage.senderId = this.currentUserId;
    this.newMessage.receiverId = this.receiverId;
    // Load messages and contact name
    this.loadMessagesAndContact().then(() => {
      this.loading = false;
      this.scrollToBottom();
    });
    // Subscribe to real-time message updates
    this.subscription.add(
      this.chatService.getMessages().subscribe(msg => {
        if (msg.receiverId === this.receiverId || msg.senderId === this.receiverId) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  async loadMessagesAndContact(): Promise<void> {
    try {
      const messages = await this.chatService.getAllMessageByUser(this.receiverId);
      this.messages = messages
        .filter((m: Message) => m.receiverId === this.receiverId || m.senderId === this.receiverId)
        .sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const contacts = await this.dbService.getAll('contacts');
      const contact = contacts.find((c: Contact) => c.id === this.receiverId);
      this.receiverName = contact?.name || this.receiverId;
    } catch (err) {
      this.errorMessage = 'Failed to load messages or contact.';
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.isInputValid()) {
      this.errorMessage = 'Please enter a message or select a file.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.newMessage.id = uuidv4();
    this.newMessage.createdAt = new Date();
    this.newMessage.status = 'sent';
    if (this.replyingTo) {
      this.newMessage.replyTo = this.replyingTo.id;
    }
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
            };
            await this.documentService.saveNewDocuments(doc);
            this.newMessage.file = doc;
          }
          await this.chatService.sendMessage(this.newMessage);
          this.messages.push({ ...this.newMessage });
          this.resetInput();
          this.scrollToBottom();
        });
      } else {
        await this.chatService.sendMessage(this.newMessage);
        // this.messages.push({ ...this.newMessage });
        this.resetInput();
        this.scrollToBottom();
      }
    } catch (err) {
      this.errorMessage = 'Failed to send message.';
    } finally {
      this.loading = false;
    }
  }

  selectDocumentFromDevice(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.selectedFile = target.files[0];
        this.sendMessage(); // Send immediately after selection
      }
    };
    input.click();
  }

  selectDocumentFromApp(): void {
    // Placeholder: Open app-specific document picker (e.g., cloud storage)
    this.errorMessage = 'Document from app selection not implemented yet.';
    // Example: Could open a dialog to select from app storage
    // this.dialog.open(DocumentPickerComponent, { data: { source: 'app' } });
  }

  selectImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.selectedFile = target.files[0];
        this.sendMessage(); // Send after media editing
      }
    };
    input.click();
  }

  sendLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.newMessage.text = `Location: ${position.coords.latitude}, ${position.coords.longitude}`;
          this.sendMessage();
        },
        (error) => {
          this.errorMessage = 'Failed to get location: ' + error.message;
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by this browser.';
    }
  }

  shareContact(): void {
    // Placeholder: Open contact picker dialog
    this.errorMessage = 'Contact sharing not implemented yet.';
    // Example: this.dialog.open(ContactPickerComponent).afterClosed().subscribe(contact => { ... });
  }

  openCamera(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera if available
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.selectedFile = target.files[0];
        this.sendMessage();
      }
    };
    input.click();
  }

  startVoiceMessage(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.selectedFile = new File([blob], `voice-message-${uuidv4()}.webm`, { type: 'audio/webm' });
          this.sendMessage();
          stream.getTracks().forEach(track => track.stop());
        };
        this.mediaRecorder.start();
        setTimeout(() => {
          if (this.mediaRecorder?.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, 60000); // Stop after 60 seconds
      }).catch(err => {
        this.errorMessage = 'Failed to access microphone: ' + err.message;
      });
    } else {
      this.errorMessage = 'Audio recording is not supported by this browser.';
    }
  }

  startAudioCall(): void {
    // Placeholder: Initiate WebRTC audio call
    this.errorMessage = 'Audio call not implemented yet.';
    // Example: Use PeerJS or similar WebRTC library
    // const peer = new Peer();
    // peer.on('call', call => { ... });
  }

  startVideoCall(): void {
    // Placeholder: Initiate WebRTC video call
    this.errorMessage = 'Video call not implemented yet.';
    // Example: Use PeerJS or similar WebRTC library
    // const peer = new Peer();
    // peer.on('call', call => { ... });
  }

  async translateMessage(msg: Message): Promise<void> {
    if (msg.text && !msg.translatedText) {
      try {
        // Assume TranslationService requires source and target language
        msg.translatedText = await this.translationService.translate(msg.text, 'auto', 'en');
        this.messages = [...this.messages]; // Trigger change detection
      } catch (err) {
        this.errorMessage = 'Translation failed.';
      }
    }
  }

  getSenderName(msg: Message): string {
    if (msg.senderId === this.currentUserId) {
      return 'You';
    }
    return this.receiverName;
  }

  downloadAttachment(id?: string, name?: string): void {
    if (!id || !name) {
      this.errorMessage = 'Invalid document.';
      return;
    }
    this.dbService.get(Tables.Documents, id).then((doc: Document) => {
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

  goBack(): void {
    this.router.navigateByUrl('/chat');
  }

  toggleSelect(msg: Message, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSelected(msg)) {
      this.selectedMessages = this.selectedMessages.filter(m => m.id !== msg.id);
    } else {
      this.selectedMessages.push(msg);
    }
    this.multiSelectMode = this.selectedMessages.length > 0;
  }

  isSelected(msg: Message): boolean {
    return this.selectedMessages.some(m => m.id === msg.id);
  }

  isInputValid(): boolean {
    return !!this.newMessage.text?.trim() || !!this.selectedFile;
  }

  cancelMultiSelect(): void {
    this.selectedMessages = [];
    this.multiSelectMode = false;
  }

  async deleteMessage(msg: Message): Promise<void> {
    try {
      await this.chatService.deleteMessage(msg.id);
      this.messages = this.messages.filter(m => m.id !== msg.id);
      this.selectedMessages = this.selectedMessages.filter(m => m.id !== msg.id);
      this.multiSelectMode = this.selectedMessages.length > 0;
    } catch (err) {
      this.errorMessage = 'Failed to delete message.';
    }
  }

  async deleteSelectedMessages(): Promise<void> {
    if (this.selectedMessages.length === 0) return;
    try {
      for (const msg of this.selectedMessages) {
        await this.chatService.deleteMessage(msg.id);
      }
      this.messages = this.messages.filter(m => !this.selectedMessages.some(sm => sm.id === m.id));
      this.cancelMultiSelect();
    } catch (err) {
      this.errorMessage = 'Failed to delete selected messages.';
    }
  }

  replyToMessage(msg: Message): void {
    this.replyingTo = msg;
    this.newMessage.text = '';
    this.focusInput();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.newMessage.text = '';
  }

  forwardMessage(msg: Message): void {
    // Placeholder: Open contact picker for forwarding
    this.errorMessage = 'Forwarding not implemented yet.';
    // Example: this.dialog.open(ContactPickerComponent).afterClosed().subscribe(contact => { ... });
  }

  forwardSelectedMessages(): void {
    if (this.selectedMessages.length === 0) return;
    // Placeholder: Open contact picker for forwarding multiple messages
    this.errorMessage = 'Forwarding selected messages not implemented yet.';
    // Example: this.dialog.open(ContactPickerComponent).afterClosed().subscribe(contact => { ... });
    this.cancelMultiSelect();
  }

  private resetInput(): void {
    this.newMessage = { id: '', senderId: this.currentUserId, receiverId: this.receiverId, createdAt: new Date(), status: 'sent' };
    this.selectedFile = undefined;
    this.replyingTo = null;
    const textarea = document.querySelector('textarea[name="messageText"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = '2rem'; // Reset to 1 row
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 0);
  }

  private focusInput(): void {
    const textarea = document.querySelector('textarea[name="messageText"]') as HTMLTextAreaElement;
    if (textarea) textarea.focus();
  }
}