import { Component, EventEmitter, Input, Output, OnChanges, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { AppService, AuthService, StorageAccountService } from '../../../services';
import { IStorageAccount } from '../../../models';
import { take } from 'rxjs';

@Component({
  selector: 'app-storage-accounts',
  templateUrl: './storage-accounts.component.html',
  styleUrls: ['./storage-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageAccountsComponent implements OnChanges {
  @Input() storageAccounts: IStorageAccount[] = [];
  @Input() loading = false;
  @Output() storageAccountsChange = new EventEmitter<IStorageAccount[]>();
  @Output() successMessage = new EventEmitter<string>();
  @Output() errorMessage = new EventEmitter<string>();

  constructor(
    public appService: AppService,
    private authService: AuthService,
    private storageService: StorageAccountService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['storageAccounts'])
      this.loadStorageQuotas();
  }

  async loadStorageQuotas(): Promise<void> {
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
              this.storageAccountsChange.emit(this.storageAccounts);
            });
        } catch (err) {
          console.error(`Failed to load quota for account ${account.id}:`, err);
        }
      }
    }
  }

  addGoogleDriveAccount(): void {
    const obs = this.storageService.addGoogleAccount();
    obs
      .pipe(take(1))
      .subscribe(response => {
        this.authService.getLoggedInUserInfoFromBackend().subscribe(user => {
          this.storageAccounts = user?.storageAccounts || [];
          this.storageAccountsChange.emit(this.storageAccounts);
          this.loadStorageQuotas();
          this.successMessage.emit('Google Drive account added successfully.');
        });
      });
  }

  async deleteStorageAccount(storageAccount: IStorageAccount): Promise<void> {
    const confirmDelete = await this.appService.confirmForDelete(`storage account ${storageAccount.label} provided by ${storageAccount.provider}`);
    if (!confirmDelete) return;

    this.loading = true;
    try {
      this.storageService.deleteAccount(storageAccount.id).subscribe(() => {
        this.storageAccounts = this.storageAccounts.filter(account => account.id !== storageAccount.id);
        this.storageAccountsChange.emit(this.storageAccounts);
        this.successMessage.emit('Storage account deleted successfully.');
        this.authService.getLoggedInUserInfoFromBackend();
      });
    } catch (err) {
      this.errorMessage.emit('Failed to delete storage account.');
    }
    this.loading = false;
  }
}