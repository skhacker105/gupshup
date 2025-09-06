import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppService, AuthService, DbService, StorageAccountService } from '../../../../services';
import { ExpirationPeriod, SUPPORTED_LANGUAGES } from '../../../../models';
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
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private dbService: DbService,
    public appService: AppService,
    private authService: AuthService,
    private storageService: StorageAccountService
  ) {
    this.settingsForm = this.fb.group({
      targetLanguage: ['en'],
      defaultPeriod: ['1week']
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const user = await this.authService.getLoggedInUserInfo();
      if (!user) return;

      this.typeExpirations = user.expirationSettings?.typeExpirations || {};
      this.settingsForm = this.fb.group({
        targetLanguage: [user.targetLanguage || 'en'],
        defaultPeriod: [user.expirationSettings?.defaultPeriod || '1week'],
        ...this.buildTypeExpirationControls()
      });
    } catch (err) {
      this.errorMessage = 'Failed to load settings.';
    }
    this.loading = false;
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
      await this.dbService.updateUser(user);
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

  addGoogleDriveAccount() {
    const obs = this.storageService.addGoogleAccount();
    obs
      .pipe(take(1))
      .subscribe(response => {
        console.log('addGoogleDriveAccount response = ', response);
        this.authService.getLoggedInUserInfoFromBackend();
      })
  }
}