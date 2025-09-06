import { Component, OnInit } from '@angular/core';
import { IStorageAccount } from '../../../../models';
import { AppService, AuthService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = false;
  errorMessage = '';
  storageAccounts: IStorageAccount[] = [];

  constructor(
    public appService: AppService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserStorageAccounts();
  }

  async loadUserStorageAccounts() {
    this.loading = true;
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (user) {
        this.storageAccounts = user.storageAccounts || [];
      }
    } catch {
      this.errorMessage = 'Failed to load user storage accounts.';
    }
    this.loading = false;
  }

  changePicture() {
    console.log('Change Picture clicked');
    // TODO: open upload dialog or file picker
  }

  updateInfo() {
    this.router.navigateByUrl('/profile/update-info');
  }

  changePassword() {
    console.log('Change Password clicked');
    // e.g., open dialog or navigate to /profile/change-password
    this.router.navigateByUrl('/profile/change-password');
  }

  gotoSettings() {
    this.router.navigateByUrl('/settings');
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
