import { Component, OnInit } from '@angular/core';
import { IStorageAccount } from '../../../../models';
import { AppService, AuthService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  loading = false;
  errorMessage = '';
  storageAccounts: IStorageAccount[] = [];

  constructor(
    public appService: AppService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserStorageAccounts();
  }

  async loadUserStorageAccounts() {
    this.loading = true;
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) return;

      this.storageAccounts = user.storageAccounts || [];
    } catch (err) {
      this.errorMessage = 'Failed to load user storage accounts.';
    }
    this.loading = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login')
  }
}
