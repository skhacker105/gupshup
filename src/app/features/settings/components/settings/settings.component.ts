// src/app/features/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DbService } from '../../../../services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  targetLanguage = 'en-US';
  defaultPeriod = '1week';
  typeExpirations: { [key: string]: string } = {};
  availableLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
  periods = ['1week', '1month', 'immediate', 'never'];
  loading = false;
  errorMessage = '';
  successMessage = '';
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    private dbService: DbService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const user = await this.dbService.getUser();
      this.targetLanguage = user.targetLanguage || 'en-US';
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
      const user = await this.dbService.getUser();
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