import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../models';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user: User = { id: '', phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
  confirmPassword = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.authService.signup(this.user).subscribe(() => this.router.navigate(['/login']));
  }
}