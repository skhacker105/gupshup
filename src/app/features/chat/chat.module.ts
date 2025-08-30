// src/app/features/chat/chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { GroupCreateComponent } from './components/group-create/group-create.component';
import { MediaEditorComponent } from './components/media-editor/media-editor.component';
import { AddContactDialogComponent } from './components/add-contact-dialog/add-contact-dialog.component';
import { SwipeRightDirective } from '../../core/directives';

@NgModule({
  declarations: [
    ChatListComponent,
    ChatWindowComponent,
    GroupCreateComponent,
    MediaEditorComponent,
    AddContactDialogComponent,
    SwipeRightDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }