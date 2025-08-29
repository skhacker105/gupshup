// src/app/features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from '../../../../models';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  user: User = { id: '', phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
  confirmPassword = '';
  errorMessage = '';
  loading = false;
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  onSignup() {
    this.loading = true;
    this.errorMessage = '';
    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.loading = false;
      return;
    }
    this.authService.signup(this.user).subscribe(
      () => this.router.navigate(['/login']),
      err => {
        this.errorMessage = 'Signup failed. Please try again.';
        this.loading = false;
      }
    );
  }
}