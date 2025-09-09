import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IDocument, IMessage } from '../../../models';
import { stringToFile } from '../../../core/indexeddb-handler/utils/file';
import { AppService, DocumentService } from '../../../services';
import { EMPTY_FILE } from '../../../constants';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: IMessage;
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
  @Output() replyMessage = new EventEmitter<IMessage>();
  @Output() forwardMessage = new EventEmitter<IMessage>();
  @Output() deleteMessage = new EventEmitter<IMessage>();
  @Output() translateMessage = new EventEmitter<IMessage>();
  @Output() downloadAttachment = new EventEmitter<{ id: string, name: string }>();

  fileURL = '';
  documentFile: IDocument | undefined;

  get senderName(): string {
    return this.message.senderId === this.receiverId ? 'Them' : 'You'; // Simplified; use actual names if passed
  }

  get repliedToText(): string {
    // Placeholder: Would fetch replied message text
    return 'Replied message text';
  }

  get isImage(): boolean {
    return this.documentFile?.type?.startsWith('image/') || false;
  }

  get isVideo(): boolean {
    return this.documentFile?.type?.startsWith('video/') || false;
  }

  get isAudio(): boolean {
    return this.documentFile?.type?.startsWith('audio/') || false;
  }

  get isDocument(): boolean {
    return !!this.documentFile && !this.isImage && !this.isVideo && !this.isAudio;
  }

  constructor(public documentService: DocumentService, public appService: AppService) { }

  async ngOnInit() {
    this.documentFile = await this.getDocument();
    this.fileURL = await this.getFileUrl();
  }

  async getFileUrl(): Promise<string> {
    const data = this.documentFile?.data && this.documentFile.data !== EMPTY_FILE
      ? await stringToFile(this.documentFile.data, this.documentFile.type)
      : undefined;

    if (!data) return '';

    return URL.createObjectURL(data);
  }

  getDocumentIcon(): string {
    const ext = this.documentFile?.name.split('.').pop()?.toLowerCase();
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

  async getDocument(): Promise<IDocument | undefined> {
    if (this.message.documentId)
      return await this.documentService.getDocument(this.message.documentId)
    return;
  }

  onMessageClick(event: MouseEvent): void {
    if (this.multiSelectMode) {
      this.onSelectionChange(event);
    }
  }

  async onDocumentClick(item: IDocument, event: MouseEvent) {
    if (this.multiSelectMode) return;
    event.stopPropagation();

    if (item.data === EMPTY_FILE) {
      // add code for download from storage account and open
      this.documentFile = await this.documentService.downloadBackup(item);
    } else {
      this.documentService.openDocument(item);
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
    alert(`IMessage info: ${this.message.id}\nTime: ${this.message.createdAt}`);
  }
}