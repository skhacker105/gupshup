import { Component, OnInit } from '@angular/core';
import { IStorageAccount } from '../../../../models';
import { StorageAccountService } from '../../../../services';

@Component({
  selector: 'app-storage-accounts',
  templateUrl: './storage-accounts.component.html',
  styleUrls: ['./storage-accounts.component.scss']
})
export class StorageAccountsComponent implements OnInit {
  storageAccounts: IStorageAccount[] = [];

  constructor(private storageService: StorageAccountService) { }

  ngOnInit() {
    this.storageService.getAccounts().subscribe(acc => this.storageAccounts = acc);
  }

  addGoogleAccount() {
    this.storageService.addGoogleAccount();
  }

  deleteAccount(id: string) {
    this.storageService.getBackupCount(id).then(count => {
      if (confirm(`Deleting this account may lose ${count} backups. Proceed?`)) {
        this.storageService.deleteAccount(id).subscribe(() => this.ngOnInit());
      }
    });
  }
}