import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppService, AuthService, StorageAccountService } from '../../../../services';
import { ExpirationPeriod, IStorageAccount, SUPPORTED_LANGUAGES } from '../../../../models';
import { take } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  availableLanguages = SUPPORTED_LANGUAGES;
  periods = Object.entries(ExpirationPeriod).map(([text, key]) => ({ text, key }));
  typeExpirations: { [key: string]: string } = {};
  storageAccounts: IStorageAccount[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    private authService: AuthService,
    private storageService: StorageAccountService
  ) {
    this.settingsForm = this.fb.group({
      targetLanguage: ['en'],
      defaultPeriod: [ExpirationPeriod.OneWeek]
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) throw new Error('User not found');

      this.typeExpirations = user.expirationSettings?.typeExpirations || {};
      this.storageAccounts = user.storageAccounts || [];
      await this.loadStorageQuotas();
      this.settingsForm = this.fb.group({
        targetLanguage: [user.targetLanguage || 'en'],
        defaultPeriod: [user.expirationSettings?.defaultPeriod || ExpirationPeriod.OneWeek],
        ...this.buildTypeExpirationControls()
      });
    } catch (err) {
      this.errorMessage = 'Failed to load settings.';
    }
    this.loading = false;
  }

  private async loadStorageQuotas(): Promise<void> {
    for (const account of this.storageAccounts) {
      if (account.provider === 'google') {
        try {
          this.storageService.getAccountsQuota(account.id)
            .pipe(take(1))
            .subscribe(quotaData => {
              account.quota = {
                ...quotaData,
                usagePercentage: Math.round((quotaData.usedBytes / quotaData.totalBytes) * 100)
              };
            })
        } catch (err) {
          console.error(`Failed to load quota for account ${account.id}:`, err);
        }
      }
    }
  }

  private buildTypeExpirationControls(): { [key: string]: any } {
    const controls: { [key: string]: any } = {};
    Object.keys(this.typeExpirations).forEach(key => {
      controls[`typeExpiration-${key}`] = [this.typeExpirations[key]];
    });
    return controls;
  }

  async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid || this.settingsForm.pristine) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) return;

      user.targetLanguage = this.settingsForm.value.targetLanguage;
      user.expirationSettings = {
        defaultPeriod: this.settingsForm.value.defaultPeriod,
        typeExpirations: {}
      };
      Object.keys(this.settingsForm.value).forEach(key => {
        if (key.startsWith('typeExpiration-') && user.expirationSettings) {
          const type = key.replace('typeExpiration-', '');
          user.expirationSettings.typeExpirations[type] = this.settingsForm.value[key];
        }
      });
      this.authService.saveLoggedInUserInfo(user)
      this.successMessage = 'Settings saved successfully.';
      this.settingsForm.markAsPristine();
    } catch (err) {
      this.errorMessage = 'Failed to save settings.';
    }
    this.loading = false;
  }

  addTypeExpiration(): void {
    const type = prompt('Enter media type (e.g., image, video):');
    if (type && !this.typeExpirations[type]) {
      this.typeExpirations[type] = this.settingsForm.value.defaultPeriod;
      this.settingsForm.addControl(`typeExpiration-${type}`, this.fb.control(this.typeExpirations[type]));
      this.settingsForm.markAsDirty();
    }
  }
}