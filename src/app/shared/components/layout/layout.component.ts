import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  @Input() title = '';
  @Input() selectionMode = false;
  @Input() isPopup = false;
  @Input() isDesktop = false;
  @Input() isTablet = false;
  @Input() isMobile = false;

  @Output() close = new EventEmitter<void>();
  @Output() swipeRight = new EventEmitter<void>();
  @Output() cancelMultiSelect = new EventEmitter<void>();
}
