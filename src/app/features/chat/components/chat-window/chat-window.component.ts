import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TrackByFunction } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IMessage, IDocument, Contact, Tables, User } from '../../../../models';
import { AppService, ChatService, DocumentService, TranslationService, AuthService, ContactService } from '../../../../services';
import { MatDialog } from '@angular/material/dialog';
import { MediaEditorComponent } from '../media-editor/media-editor.component';
import { fileToString } from '../../../../core/indexeddb-handler/utils/file';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: IMessage[] = [];
  newMessage: IMessage = { id: '', senderId: '', receiverId: '', createdAt: new Date(), status: 'sent' };
  selectedMessages: IMessage[] = [];
  multiSelectMode = false;
  currentUser: User | undefined;
  receiverId = 'dummy-receiver-id';
  receiverName = 'Dummy Contact';
  selectedFile?: File;
  loading = false;
  errorMessage = '';
  replyingTo: IMessage | null = null;
  private subscription: Subscription = new Subscription();
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];

  get currentUserId(): string {
    return this.currentUser?.id ?? '';
  }

  constructor(
    public appService: AppService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private documentService: DocumentService,
    private translationService: TranslationService,
    private contactService: ContactService,
    private dialog: MatDialog
  ) { }

  trackByMessageId: TrackByFunction<IMessage> = (index: number, msg: IMessage) => msg.id;

  async ngOnInit() {
    this.loading = true;
    this.currentUser = await this.authService.getLoggedInUserInfo();
    this.receiverId = this.route.snapshot.paramMap.get('id') || 'dummy-receiver-id';
    this.newMessage.senderId = this.currentUserId;
    this.newMessage.receiverId = this.receiverId;
    // this.newMessage.senderId = this.receiverId // currentUserId;
    // this.newMessage.receiverId = this.currentUserId // receiverId;
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
        .filter((m: IMessage) => m.receiverId === this.receiverId || m.senderId === this.receiverId)
        .sort((a: IMessage, b: IMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const contact = await this.contactService.getContactById(this.receiverId)
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
            const editedFileStr = await fileToString(editedFile);
            const doc: IDocument = {
              id: uuidv4(),
              name: editedFile.name,
              type: editedFile.type,
              data: editedFileStr,
              senderId: this.currentUserId,
              receiverId: this.receiverId,
              createdDate: new Date(),
            };
            await this.documentService.saveNewDocuments(doc);
            this.newMessage.documentId = doc.id;
          }
          await this.chatService.sendMessage(this.newMessage);
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
    this.errorMessage = 'IDocument from app selection not implemented yet.';
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

  async translateMessage(msg: IMessage): Promise<void> {
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

  getSenderName(msg: IMessage): string {
    if (msg.senderId === this.currentUserId) {
      return 'You';
    }
    return this.receiverName;
  }

  downloadAttachment(documentId?: string): void {
    // if (!id || !name) {
    //   this.errorMessage = 'Invalid document.';
    //   return;
    // }
    // this.dbService.get(Tables.Documents, id).then((doc: IDocument) => {
    //   if (doc) {
    //     const url = URL.createObjectURL(doc.data);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = name;
    //     a.click();
    //     URL.revokeObjectURL(url);
    //   } else {
    //     this.errorMessage = 'Document not found.';
    //   }
    // }).catch(err => {
    //   this.errorMessage = 'Error downloading document.';
    // });
  }

  showInfo(): void {
    alert(`Chatting with ${this.receiverName}\nID: ${this.receiverId}`);
  }

  goBack(): void {
    this.router.navigateByUrl('/chat');
  }

  toggleSelect(msg: IMessage, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSelected(msg)) {
      this.selectedMessages = this.selectedMessages.filter(m => m.id !== msg.id);
    } else {
      this.selectedMessages.push(msg);
    }
    this.multiSelectMode = this.selectedMessages.length > 0;
  }

  isSelected(msg: IMessage): boolean {
    return this.selectedMessages.some(m => m.id === msg.id);
  }

  isInputValid(): boolean {
    return !!this.newMessage.text?.trim() || !!this.selectedFile;
  }

  enableMobileMultiSelect(): void {
    this.multiSelectMode = true;
  }

  cancelMultiSelect(): void {
    this.selectedMessages = [];
    this.multiSelectMode = false;
  }

  async deleteMessage(msg: IMessage): Promise<void> {
    const confirmToDelete = await this.appService.confirmForDelete((msg.text ? msg.text : 'message'));
    if (!confirmToDelete) return;

    let deleteDocument = false;
    if (msg.documentId) {
      // ask if to delete document
      deleteDocument = await this.appService.confirmForDelete(('document attached with the message'));
    }

    try {
      this.loading = true;
      await this.chatService.deleteMessage(msg.id);
      if (deleteDocument && msg.documentId) {
        await this.documentService.deleteDocument(msg.documentId);
      }
      this.messages = this.messages.filter(m => m.id !== msg.id);
      this.selectedMessages = this.selectedMessages.filter(m => m.id !== msg.id);
      this.multiSelectMode = this.selectedMessages.length > 0;
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.errorMessage = 'Failed to delete message.';
    }
  }

  async deleteSelectedMessages(): Promise<void> {
    if (this.selectedMessages.length === 0) return;

    const confirmToDelete = await this.appService.confirmForDelete(('all selected messages'));
    if (!confirmToDelete) return;

    try {
      const delMsgsPromises: Promise<any>[] = [];
      for (const msg of this.selectedMessages) {
        delMsgsPromises.push(this.chatService.deleteMessage(msg.id));
      }
      await Promise.all(delMsgsPromises);
      this.messages = this.messages.filter(m => !this.selectedMessages.some(sm => sm.id === m.id));
      this.cancelMultiSelect();
    } catch (err) {
      this.errorMessage = 'Failed to delete selected messages.';
    }
  }

  replyToMessage(msg: IMessage): void {
    this.replyingTo = msg;
    this.newMessage.text = '';
    this.focusInput();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.newMessage.text = '';
  }

  forwardMessage(msg: IMessage): void {
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
    this.newMessage = {
      id: '',
      senderId: this.currentUserId,
      receiverId: this.receiverId,
      createdAt: new Date(), status: 'sent'
    };
    this.selectedFile = undefined;
    this.replyingTo = null;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 100);
  }

  private focusInput(): void {
    const textarea = document.querySelector('textarea[name="messageText"]') as HTMLTextAreaElement;
    if (textarea) textarea.focus();
  }
}