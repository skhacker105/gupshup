import { Component } from '@angular/core';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  identifier = '';

  constructor(private authService: AuthService) {}

  onReset() {
    this.authService.forgotPassword(this.identifier).subscribe(() => alert('Reset code sent'));
  }
}