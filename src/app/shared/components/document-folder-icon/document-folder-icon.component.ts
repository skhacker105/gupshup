// src/app/components/document-folder-icon/document-folder-icon.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Folder, IDocument } from '../../../models';
import { EMPTY_FILE } from '../../../constants';

@Component({
  selector: 'app-document-folder-icon',
  templateUrl: './document-folder-icon.component.html',
  styleUrls: ['./document-folder-icon.component.scss']
})
export class DocumentFolderIconComponent {
  @Input() item!: IDocument | Folder;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() hideBackupAction = false;

  @Input() isDesktop = false;
  @Input() isTablet = false;
  @Input() isMobile = false;

  @Input() selectionMode = false;
  @Input() selected = false;

  @Output() longPress = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<MouseEvent>();
  @Output() onMarkForBackup = new EventEmitter<void>();

  get isFolder(): boolean {
    return !('data' in this.item); // Discriminator: Documents have 'data: Blob'
  }

  get isDocument(): boolean {
    return 'data' in this.item;
  }

  get isEmptyFile(): boolean {
    return 'data' in this.item && this.item.data === EMPTY_FILE
  }

  get documentItem(): IDocument {
    return this.item as IDocument;
  }

  get iconClass(): string {
    if (this.isFolder) {
      return 'fa-folder';
    }

    const extension = this.item.name.split('.').pop()?.toLowerCase();
    let className = '';
    switch (extension) {
      case 'pdf':
        className = 'fa-file-pdf'; break;
      case 'doc':
      case 'docx':
        className = 'fa-file-word'; break;
      case 'zip':
      case 'rar':
        className = 'fa-file-archive'; break;
      case 'txt':
        className = 'fa-file-alt'; break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        className = 'fa-file-image'; break;
      case 'xls':
      case 'xlsx':
        className = 'fa-file-excel'; break;
      case 'ppt':
      case 'pptx':
        className = 'fa-file-powerpoint'; break;
      case 'mp3':
      case 'wav':
        className = 'fa-file-audio'; break;
      case 'mp4':
      case 'avi':
        className = 'fa-file-video'; break;
      case 'csv':
        className = 'fa-file-csv'; break;
      default:
        className = 'fa-file'; break;
    }

    if (this.isEmptyFile && this.isDocument) {
      className += ' disabled-icon';
    }

    return className;
  }

  get classes() {
    return {
      [this.size]: true,
      mobile: this.isMobile,
      tablet: this.isTablet,
      desktop: this.isDesktop
    };
  }

  markForBackup(event: MouseEvent): void {
    event.stopPropagation();
    this.onMarkForBackup.emit();
    // Placeholder for backup functionality
    // console.log('Mark for backup:', this.documentItem.id);
    // TODO: Implement backup marking process, e.g., service call to mark document
    // For demo, simulate local update
    // this.documentItem.backupAccountId = 'simulated-backup-id';
  }

  onRadioClick(event: MouseEvent): void {
    event.stopPropagation();
    this.onClick.emit(event);
  }
}