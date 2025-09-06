import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AppService, AuthService, DbService } from './services';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  selectedTabIndex = 0;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private dbService: DbService,
    public appService: AppService
  ) {
  }

  ngOnInit(): void {
    this.router.navigate(['/chat']); // Default to Chat tab
    setTimeout(() => {
      if (this.authService.isLoggedIn()) this.authService.getLoggedInUserInfoFromBackend().pipe(take(1)).subscribe(res => {});
    }, 1000);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    const routes = ['/chat', '/docs', '/profile'];
    this.router.navigate([routes[index]]);
  }

  async logout(): Promise<void> {
    try {
      await this.dbService.updateUser({ id: this.dbService.getDeviceId(), phoneNumber: '' });
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to log out. Please try again.');
    }
  }
}