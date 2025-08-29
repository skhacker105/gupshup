import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Language, SUPPORTED_LANGUAGES } from '../../../../models';
import { DbService } from '../../../../services';

@Component({
  selector: 'app-translation-settings',
  templateUrl: './translation-settings.component.html',
  styleUrls: ['./translation-settings.component.scss']
})
export class TranslationSettingsComponent implements OnInit {
  languages: Language[] = SUPPORTED_LANGUAGES;
  targetLanguage = 'en-US';
  loading = false;
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
    const user = await this.dbService.getUser();
    this.targetLanguage = user.targetLanguage || 'en-US';
  }

  async save(): Promise<void> {
    this.loading = true;
    const user = await this.dbService.getUser();
    user.targetLanguage = this.targetLanguage;
    await this.dbService.updateUser(user);
    this.loading = false;
  }
}