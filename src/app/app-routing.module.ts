import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  // { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule), canActivate: [AuthGuard] },
  // { path: 'chat', loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule), canActivate: [AuthGuard] },
  // { path: 'docs', loadChildren: () => import('./features/docs/docs.module').then(m => m.DocsModule), canActivate: [AuthGuard] },
  // { path: 'settings', loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule), canActivate: [AuthGuard] }
  
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'chat', loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule) },
  { path: 'docs', loadChildren: () => import('./features/docs/docs.module').then(m => m.DocsModule) },
  { path: 'settings', loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }