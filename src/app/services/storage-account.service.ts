import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, DbService } from './';
import { StorageAccount, Document, Tables } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageAccountService {

  private apiAccounts = environment.storageAccountService + 'accounts';
  // private apiUrl = 'http://storage-account-serviceURL'; // Replace with actual URL

  constructor(
    private http: HttpClient,
    private dbService: DbService,
    private authService: AuthService
  ) { }

  addGoogleAccount(): void {
    const token = this.authService.getToken();
    const url = `${this.apiAccounts}/add/google?token=${token}`;
    const popup = window.open(url, '_blank', 'width=50%,height=50%');
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
      }
    }, 500);
  }

  getAccounts(): Observable<StorageAccount[]> {
    return this.http.get<StorageAccount[]>(`${this.apiAccounts}`);
  }

  deleteAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiAccounts}/${id}`);
  }

  async upload(doc: Document, accountId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', doc.data, doc.name);
    formData.append('accountId', accountId);
    formData.append('documentId', doc.id);
    return this.http.post(`${this.apiAccounts}/upload`, formData).toPromise();
  }

  async getBackupCount(accountId: string): Promise<number> {
    const documents = await this.dbService.getAll(Tables.Documents);
    return documents.filter((doc: Document) => doc.backupAccountId === accountId).length;
  }
}