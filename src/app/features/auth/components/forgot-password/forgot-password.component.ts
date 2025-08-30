// src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';

import { AppService, AuthService } from '../../../../services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  identifier = '';
  message = '';
  loading = false;


  constructor(
    private authService: AuthService,
    public appService: AppService
  ) {
    
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