// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AppService, AuthService } from '../../../../services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage = '';
  loading = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    public appService: AppService
  ) {
    
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe(
      () => this.router.navigate(['/home']),
      err => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    );
  }
}