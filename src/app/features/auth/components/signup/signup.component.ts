// src/app/features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../../../models';
import { AppService, AuthService } from '../../../../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  user: User = { id: '', phoneNumber: '', password: '', targetLanguage: 'en', storageAccounts: [] };
  confirmPassword = '';
  errorMessage = '';
  loading = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    public appService: AppService
  ) {
    
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
      () => this.router.navigate(['/auth/login']),
      err => {
        this.errorMessage = 'Signup failed. Please try again.';
        this.loading = false;
      }
    );
  }
}