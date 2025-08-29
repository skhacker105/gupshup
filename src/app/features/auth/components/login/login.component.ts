import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials = { phoneOrEmail: '', password: '' };

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.credentials).subscribe(() => this.router.navigate(['/home']));
  }
}