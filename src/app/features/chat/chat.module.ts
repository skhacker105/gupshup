// src/app/features/chat/chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { GroupCreateComponent } from './components/group-create/group-create.component';
import { MediaEditorComponent } from './components/media-editor/media-editor.component';
import { AddContactDialogComponent } from './components/add-contact-dialog/add-contact-dialog.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ChatListComponent,
    ChatWindowComponent,
    GroupCreateComponent,
    MediaEditorComponent,
    AddContactDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChatRoutingModule,
    SharedModule
  ]
})
export class ChatModule { }
