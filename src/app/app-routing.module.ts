import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features').then(m => m.AuthModule) },
  { path: 'profile', loadChildren: () => import('./features').then(m => m.HomeModule), canActivate: [AuthGuard] },
  { path: 'chat', loadChildren: () => import('./features').then(m => m.ChatModule), canActivate: [AuthGuard] },
  { path: 'docs', loadChildren: () => import('./features').then(m => m.DocsModule), canActivate: [AuthGuard] },
  { path: 'settings', loadChildren: () => import('./features').then(m => m.SettingsModule), canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }