import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
    selector: '[appLongPress]'
})
export class LongPressDirective {
    @Input() appLongPress = true; // enable/disable
    @Output() modeSwitched = new EventEmitter<void>();

    private pressTimeout: any;
    private readonly pressDuration = 1000; // 1 second for long press
    private longPressTriggered = false;

    constructor() {
        // console.log('appLongPress directive initialized');
    }

    // Unified for mouse + touch + pen
    @HostListener('pointerdown', ['$event'])
    onPointerDown(event: PointerEvent) {
        if (!this.appLongPress) return;

        this.longPressTriggered = false;
        console.log('Long press started', event.type);

        this.pressTimeout = setTimeout(() => {
            this.longPressTriggered = true;
            // console.log('Long press recognized');
            this.modeSwitched.emit();

            // prevent click from firing after long press
            event.preventDefault();
            event.stopPropagation();
        }, this.pressDuration);
    }

    @HostListener('pointerup', ['$event'])
    @HostListener('pointerleave', ['$event'])
    onPointerUpOrLeave(event: PointerEvent) {
        if (!this.appLongPress) return;

        // console.log('Long press ended', event.type);
        clearTimeout(this.pressTimeout);
    }

    // Suppress click if long press was already triggered
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.longPressTriggered) {
            // console.log('Click suppressed after long press');
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
