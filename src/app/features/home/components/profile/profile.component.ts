import { Component, OnInit } from '@angular/core';
import { IStorageAccount } from '../../../../models';
import { AuthService } from '../../../../services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  loading = false;
  errorMessage = '';
  storageAccounts: IStorageAccount[] = [];

  constructor(private authService: AuthService) {}

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
}
