import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService, AuthService, DbService } from './services';
import { take } from 'rxjs';

interface Tab {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  selectedTabIndex = 0;

  // Define tabs in one place
  tabs: Tab[] = [
    { label: 'Chat', icon: 'fa fa-comments', route: '/chat' },
    { label: 'Documents', icon: 'fa fa-file', route: '/docs' },
    { label: 'Profile', icon: 'fa fa-user', route: '/profile' },
  ];

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private dbService: DbService,
    public appService: AppService
  ) {}

  ngOnInit(): void {
    this.router.navigate(['/chat']); // Default tab
    setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.getLoggedInUserInfoFromBackend()
          .pipe(take(1))
          .subscribe(() => {});
      }
    }, 1000);
  }

  onTabClick(index: number): void {
    this.selectedTabIndex = index;
    this.router.navigate([this.tabs[index].route]);
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
