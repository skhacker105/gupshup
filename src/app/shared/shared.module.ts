import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainMenuComponent } from './components/main-menu/main-menu.component';

@NgModule({
    declarations: [
        MainMenuComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        MainMenuComponent
    ]
})
export class SharedModule { }