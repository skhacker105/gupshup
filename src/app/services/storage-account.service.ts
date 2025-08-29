import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DbService } from './';
import { StorageAccount, Document } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageAccountService {
  private apiUrl = 'http://storage-account-serviceURL'; // Replace with actual URL

  constructor(
    private http: HttpClient,
    private dbService: DbService
  ) { }

  addGoogleAccount(): void {
    const popup = window.open(`${this.apiUrl}/accounts/add/google`, '_blank', 'width=500,height=500');
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
      }
    }, 500);
  }

  getAccounts(): Observable<StorageAccount[]> {
    return this.http.get<StorageAccount[]>(`${this.apiUrl}/accounts`);
  }

  deleteAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/accounts/${id}`);
  }

  async upload(doc: Document, accountId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', doc.data, doc.name);
    formData.append('accountId', accountId);
    formData.append('documentId', doc.id);
    return this.http.post(`${this.apiUrl}/upload`, formData).toPromise();
  }

  async getBackupCount(accountId: string): Promise<number> {
    const documents = await this.dbService.getAll('documents');
    return documents.filter((doc: Document) => doc.backupAccountId === accountId).length;
  }
}