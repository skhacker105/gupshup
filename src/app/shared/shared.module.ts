import { NgModule } from '@angular/core';
import { SwipeRightDirective } from './directives';
import { SelectableRowComponent } from './components/selectable-row/selectable-row.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [SwipeRightDirective, SelectableRowComponent, LayoutComponent],
    imports: [FormsModule, CommonModule],
    exports: [SwipeRightDirective, SelectableRowComponent, LayoutComponent]
})
export class SharedModule { }