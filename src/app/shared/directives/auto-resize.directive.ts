// auto-resize.directive.ts
import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: 'textarea[autoResize]'
})
export class AutoResizeDirective {
    private minRows = 1;
    private maxRows = 5;

    constructor(private el: ElementRef<HTMLTextAreaElement>) { }

    @HostListener('input')
    onInput() {
        const textarea = this.el.nativeElement;
        const lineCount = textarea.value.split('\n').length;

        const rows = Math.min(this.maxRows, Math.max(this.minRows, lineCount));
        textarea.rows = rows;
    }
}
