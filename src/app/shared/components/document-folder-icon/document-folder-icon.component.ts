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