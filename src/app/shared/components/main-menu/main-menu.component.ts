import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { DbService } from '../../../services';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {
  isMobile = false;
  isTablet = false;
  isDesktop = true;
  isMenuOpen = false;
  isSubmenuOpen = false; // For tablet dropdown

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dbService: DbService
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
      this.isMenuOpen = !this.isMobile; // Open by default on tablet/desktop
      this.isSubmenuOpen = false; // Reset submenu on resize
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) this.isSubmenuOpen = false; // Close submenu when main menu closes
  }

  toggleSubmenu(): void {
    if (this.isTablet) this.isSubmenuOpen = !this.isSubmenuOpen;
  }

  async logout(): Promise<void> {
    try {
      await this.dbService.updateUser({ id: this.dbService.getDeviceId(), phoneNumber: '' });
      await this.router.navigate(['/auth/login']);
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to log out. Please try again.');
    }
  }
}