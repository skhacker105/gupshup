import { Component, OnInit } from '@angular/core';

import { Language, SUPPORTED_LANGUAGES } from '../../../../models';
import { AuthService, DbService } from '../../../../services';

@Component({
  selector: 'app-translation-settings',
  templateUrl: './translation-settings.component.html',
  styleUrls: ['./translation-settings.component.scss']
})
export class TranslationSettingsComponent implements OnInit {
  languages: Language[] = SUPPORTED_LANGUAGES;
  targetLanguage = 'en-US';
  loading = false;


  constructor(
    private dbService: DbService,
    private authService: AuthService
  ) {

  }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getLoggedInUserInfo();
    this.targetLanguage = user?.targetLanguage || 'en-US';
  }

  async save(): Promise<void> {
    this.loading = true;
    const user = await this.authService.getLoggedInUserInfo();
    if (!user) return;

    user.targetLanguage = this.targetLanguage;
    await this.dbService.updateUser(user);
    this.loading = false;
  }
}