// src/app/shared/components/main-menu/main-menu.component.ts
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

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dbService: DbService
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
      if (!this.isMobile) this.isMenuOpen = true;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout(): Promise<void> {
    await this.dbService.updateUser({ id: this.dbService.getDeviceId()!, phoneNumber: '' });
    this.router.navigate(['/login']);
  }
}