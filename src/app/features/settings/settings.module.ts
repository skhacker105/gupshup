import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { TranslationSettingsComponent } from './components/translation-settings/translation-settings.component';
import { StorageAccountsComponent } from './components/storage-accounts/storage-accounts.component';
import { ExpirationSettingsComponent } from './components/expiration-settings/expiration-settings.component';

@NgModule({
  declarations: [
    SettingsComponent,
    TranslationSettingsComponent,
    StorageAccountsComponent,
    ExpirationSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }