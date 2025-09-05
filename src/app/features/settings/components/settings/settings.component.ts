// src/app/features/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';

import { AppService, AuthService, DbService } from '../../../../services';
import { ExpirationPeriod, SUPPORTED_LANGUAGES } from '../../../../models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  targetLanguage = 'en';
  defaultPeriod = '1week';
  typeExpirations: { [key: string]: string } = {};
  availableLanguages = SUPPORTED_LANGUAGES;
  periods = Object.entries(ExpirationPeriod).map(([text, key]) => ({ text, key })); // ['1week', '1month', 'immediate', 'never'];
  loading = false;
  errorMessage = '';
  successMessage = '';


  constructor(
    private dbService: DbService,
    public appService: AppService,
    private authService: AuthService
  ) {
    
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) return;
      
      this.targetLanguage = user.targetLanguage || 'en';
      this.defaultPeriod = user.expirationSettings?.defaultPeriod || '1week';
      this.typeExpirations = user.expirationSettings?.typeExpirations || {};
    } catch (err) {
      this.errorMessage = 'Failed to load settings.';
    }
    this.loading = false;
  }

  async saveSettings(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) return;
      
      user.targetLanguage = this.targetLanguage;
      user.expirationSettings = {
        defaultPeriod: this.defaultPeriod,
        typeExpirations: this.typeExpirations
      };
      await this.dbService.updateUser(user);
      this.successMessage = 'Settings saved successfully.';
    } catch (err) {
      this.errorMessage = 'Failed to save settings.';
    }
    this.loading = false;
  }

  addTypeExpiration(): void {
    const type = prompt('Enter media type (e.g., image, video):');
    if (type) {
      this.typeExpirations[type] = this.defaultPeriod;
    }
  }
}