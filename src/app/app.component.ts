// src/app/app.component.ts
import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }
}