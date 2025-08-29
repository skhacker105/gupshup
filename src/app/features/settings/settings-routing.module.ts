import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';
import { TranslationSettingsComponent } from './components/translation-settings/translation-settings.component';
import { StorageAccountsComponent } from './components/storage-accounts/storage-accounts.component';
import { ExpirationSettingsComponent } from './components/expiration-settings/expiration-settings.component';

const routes: Routes = [
  { path: '', component: SettingsComponent },
  { path: 'translation', component: TranslationSettingsComponent },
  { path: 'storage', component: StorageAccountsComponent },
  { path: 'expiration', component: ExpirationSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }