// src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  identifier = '';
  message = '';
  loading = false;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  onReset() {
    this.loading = true;
    this.message = '';
    this.authService.forgotPassword(this.identifier).subscribe(
      () => {
        this.message = 'Reset code sent to your email/phone.';
        this.loading = false;
      },
      err => {
        this.message = 'Failed to send reset code. Please try again.';
        this.loading = false;
      }
    );
  }
}