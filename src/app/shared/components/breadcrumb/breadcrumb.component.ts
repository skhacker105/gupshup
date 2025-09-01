import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  @Input() pathSegments: { name: string, id?: string }[] = [];
  @Output() segmentClick = new EventEmitter<{ name: string, id?: string }>();

  get displayedSegments(): { name: string, id?: string, isEllipsis?: boolean }[] {
    const maxSegments = 5;
    if (this.pathSegments.length <= maxSegments) {
      return this.pathSegments;
    }
    return [
      this.pathSegments[0],
      { name: '...', isEllipsis: true },
      ...this.pathSegments.slice(-2)
    ];
  }

  onSegmentClick(segment: { name: string, id?: string }, event: MouseEvent): void {
    // if (!segment.isEllipsis) {
      this.segmentClick.emit(segment);
    // }
  }
}