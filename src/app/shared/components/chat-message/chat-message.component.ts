import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Document, Message } from '../../../models';
import { stringToFile } from '../../../core/indexeddb-handler/utils/file';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: Message;
  @Input() isSelected = false;
  @Input() multiSelectMode = false;
  @Input() currentUserId!: string;
  @Input() receiverId!: string;
  @Input() isSent = false;
  @Input() showSenderName = true; // For grouping or first message
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() isDesktop = false;

  @Output() longPress = new EventEmitter<void>();
  @Output() toggleSelection = new EventEmitter<MouseEvent>();
  @Output() replyMessage = new EventEmitter<Message>();
  @Output() forwardMessage = new EventEmitter<Message>();
  @Output() deleteMessage = new EventEmitter<Message>();
  @Output() translateMessage = new EventEmitter<Message>();
  @Output() downloadAttachment = new EventEmitter<{id: string, name: string}>();

  fileURL = '';

  get senderName(): string {
    return this.message.senderId === this.receiverId ? 'Them' : 'You'; // Simplified; use actual names if passed
  }

  get repliedToText(): string {
    // Placeholder: Would fetch replied message text
    return 'Replied message text';
  }

  get isImage(): boolean {
    return this.message.file?.type?.startsWith('image/') || false;
  }

  get isVideo(): boolean {
    return this.message.file?.type?.startsWith('video/') || false;
  }

  get isAudio(): boolean {
    return this.message.file?.type?.startsWith('audio/') || false;
  }

  get isDocument(): boolean {
    return !!this.message.file && !this.isImage && !this.isVideo && !this.isAudio;
  }

  async ngOnInit() {
    this.fileURL = await this.getFileUrl();
  }

  async getFileUrl(): Promise<string> {
    const file = this.message.file as Document;
    const data = file.data ? await stringToFile(file.data, file.type) : undefined;
    if (!data) return '';
    
    return URL.createObjectURL(data);
  }

  getDocumentIcon(): string {
    const ext = this.message.file?.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa fa-file-pdf-o';
      case 'doc':
      case 'docx': return 'fa fa-file-word-o';
      case 'xls':
      case 'xlsx': return 'fa fa-file-excel-o';
      case 'ppt':
      case 'pptx': return 'fa fa-file-powerpoint-o';
      default: return 'fa fa-file-o';
    }
  }

  onMessageClick(event: MouseEvent): void {
    if (this.multiSelectMode) {
      this.onSelectionChange(event);
    }
  }

  onSelectionChange(event: any): void {
    // this.toggleSelection.emit(!this.isSelected);
    this.toggleSelection.emit(event);
  }

  onReply(event: MouseEvent): void {
    event.stopPropagation();
    this.replyMessage.emit(this.message);
  }

  onForward(event: MouseEvent): void {
    event.stopPropagation();
    this.forwardMessage.emit(this.message);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteMessage.emit(this.message);
  }

  onTranslate(event: MouseEvent): void {
    event.stopPropagation();
    this.translateMessage.emit(this.message);
  }

  onDownload(event: MouseEvent, id?: string, name?: string): void {
    event.stopPropagation();
    if (id && name) {
      this.downloadAttachment.emit({ id, name });
    }
  }

  async onImageClick() {
    // Open full-screen image viewer (placeholder)
    window.open(await this.getFileUrl(), '_blank');
  }

  onVideoClick(): void {
    // Play in modal or full-screen (placeholder)
    console.log('Play video full-screen');
  }

  onPlay(event: MouseEvent): void {
    event.stopPropagation();
    // Trigger audio play
    const audio = (event.target as HTMLElement).closest('.audio-attachment')?.querySelector('audio') as HTMLAudioElement;
    if (audio) audio.play();
  }

  onInfo(event: MouseEvent): void {
    event.stopPropagation();
    alert(`Message info: ${this.message.id}\nTime: ${this.message.createdAt}`);
  }
}