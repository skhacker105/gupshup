import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { DbService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isMobile = false;
  isTablet = false;
  isDesktop = true;
  selectedTabIndex = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dbService: DbService
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      const breakAndFind = (breakPoints: { [key: string]: boolean }, targetScreenSize: string) => {
        const targetScreenSizes = targetScreenSize.split(', ');
        return targetScreenSizes.some(ts => breakPoints[ts] === true)
      }
      this.isMobile = result.matches && breakAndFind(result.breakpoints, Breakpoints.Handset);
      this.isTablet = result.matches && breakAndFind(result.breakpoints, Breakpoints.Tablet);
      this.isDesktop = result.matches && breakAndFind(result.breakpoints, Breakpoints.Web);
    });
  }

  ngOnInit(): void {
    this.router.navigate(['/chat']); // Default to Chat tab
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    const routes = ['/chat', '/docs', '/settings', '/profile'];
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