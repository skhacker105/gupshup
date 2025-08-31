import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppService } from '../../../services';

@Component({
  selector: 'app-selectable-row',
  templateUrl: './selectable-row.component.html',
  styleUrls: ['./selectable-row.component.scss']
})
export class SelectableRowComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() isSelectable = false;
  @Input() selectionMode = false;
  @Input() selected = false;
  @Input() isDesktop = false;
  @Input() isTablet = false;
  @Input() isMobile = false;

  @Output() selectionChange = new EventEmitter<MouseEvent>();
  @Output() rowClick = new EventEmitter<MouseEvent>();

  onCheckboxClick(event: MouseEvent): void {
    event.stopPropagation();
    this.selectionChange.emit(event);
  }

  handleRowClick(event: MouseEvent): void {
    this.rowClick.emit(event);
  }
}
