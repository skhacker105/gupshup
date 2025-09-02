import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Folder, Document } from '../../../models';

@Component({
  selector: 'app-document-folder-icon',
  templateUrl: './document-folder-icon.component.html',
  styleUrls: ['./document-folder-icon.component.scss']
})
export class DocumentFolderIconComponent {
  @Input() item!: Document | Folder;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Input() isDesktop = false;
  @Input() isTablet = false;
  @Input() isMobile = false;

  @Output() onClick = new EventEmitter<MouseEvent>();

  get isFolder(): boolean {
    return !('data' in this.item); // Discriminator: Documents have 'data: Blob'
  }

  get isDocument(): boolean {
    return 'data' in this.item;
  }

  get documentItem(): Document {
    return this.item as Document;
  }

  get iconClass(): string {
    if (this.isFolder) {
      return 'fa-folder';
    }

    const extension = this.item.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'zip':
      case 'rar':
        return 'fa-file-archive';
      case 'txt':
        return 'fa-file-alt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'fa-file-image';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';
      case 'mp3':
      case 'wav':
        return 'fa-file-audio';
      case 'mp4':
      case 'avi':
        return 'fa-file-video';
      case 'csv':
        return 'fa-file-csv';
      default:
        return 'fa-file';
    }
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
    // Placeholder for backup functionality
    console.log('Mark for backup:', this.documentItem.id);
    // TODO: Implement backup marking process
  }
}