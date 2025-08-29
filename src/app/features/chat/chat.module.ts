import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { GroupCreateComponent } from './components/group-create/group-create.component';
import { MediaEditorComponent } from './components/media-editor/media-editor.component';

@NgModule({
  declarations: [
    ChatListComponent,
    ChatWindowComponent,
    GroupCreateComponent,
    MediaEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }