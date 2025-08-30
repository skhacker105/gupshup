import { NgModule } from '@angular/core';
import { SwipeRightDirective } from './directives';

@NgModule({
    declarations: [SwipeRightDirective],
    exports: [SwipeRightDirective]
})
export class SharedModule { }