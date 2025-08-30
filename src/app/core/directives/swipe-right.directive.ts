import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
    selector: '[appSwipeRight]'
})
export class SwipeRightDirective {
    @Input() appSwipeRight = true; // enable/disable
    @Output() swiped = new EventEmitter<void>();

    private touchStartX = 0;
    private touchEndX = 0;

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        if (!this.appSwipeRight) return;
        this.touchStartX = event.changedTouches[0].screenX;
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent) {
        if (!this.appSwipeRight) return;
        this.touchEndX = event.changedTouches[0].screenX;
        if (this.touchEndX - this.touchStartX > 60) { // swipe right threshold
            this.swiped.emit();
        }
    }
}
