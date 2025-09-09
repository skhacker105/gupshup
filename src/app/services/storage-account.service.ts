import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthService, DbService } from './';
import { IStorageAccount, IDocument, Tables, OAuthResponse, IQuotaData } from '../models';
import { environment } from '../../environments/environment';
import { CacheEvict, Cacheable } from '../core/cache';
import { stringToFile } from '../core/indexeddb-handler/utils/file';

@Injectable({
  providedIn: 'root'
})
export class StorageAccountService {
  // private domainURL = `${window.location.protocol}//${window.location.hostname}`;
  private apiAccounts = environment.storageAccountService + 'accounts';
  private apiStorage = environment.storageAccountService + 'storage';
  private popup: Window | null = null;
  private messageSubject = new Subject<OAuthResponse>();
  private checkPopupInterval: number | null = null;

  constructor(
    private http: HttpClient,
    private dbService: DbService,
    private authService: AuthService
  ) { }

  /**
   * Opens a popup for Google OAuth and returns an Observable for the response
   * @param expectedOrigin Optional origin to validate messages (e.g., 'http://localhost:3000')
   * @returns Observable<OAuthResponse>
   */
  @CacheEvict(['getAccountsQuota'])
  addGoogleAccount(expectedOrigin?: string): Observable<OAuthResponse> {
    const token = this.authService.getToken();
    if (!token) {
      this.messageSubject.error(new Error('No authentication token available'));
      return this.messageSubject.asObservable();
    }

    const url = `${this.apiAccounts}/add/google?token=${token}`;
    this.popup = window.open(url, 'oauthPopup', 'width=600,height=400');

    if (!this.popup) {
      this.messageSubject.error(new Error('Popup blocked! Please allow popups for this site.'));
      return this.messageSubject.asObservable();
    }

    // Add message event listener
    const handleMessage = (event: MessageEvent<OAuthResponse>) => {
      // Filter messages to only process those with the expected OAuthResponse structure
      if (!event.data?.status || !['success', 'error'].includes(event.data.status)) {
        return; // Ignore unrelated messages (e.g., from Angular DevTools)
      }

      // Verify the message origin if provided
      if (expectedOrigin && event.origin !== expectedOrigin) {
        console.warn(`Received message from unexpected origin: ${event.origin}`);
        return;
      }

      this.messageSubject.next(event.data);
    };
    window.addEventListener('message', handleMessage);

    // Monitor popup closure to remove event listener
    this.checkPopupInterval = window.setInterval(() => {
      if (this.popup?.closed) {
        this.cleanup(handleMessage);
      }
    }, 500); // Check every 500ms for responsiveness

    return this.messageSubject.asObservable();
  }

  /**
   * Cleans up event listener and interval
   * @param handleMessage The message event handler
   */
  private cleanup(handleMessage: (event: MessageEvent<OAuthResponse>) => void): void {
    if (this.checkPopupInterval !== null) {
      window.clearInterval(this.checkPopupInterval);
      this.checkPopupInterval = null;
    }
    window.removeEventListener('message', handleMessage);
    this.popup = null;
  }

  getAccounts(): Observable<IStorageAccount[]> {
    return this.http.get<IStorageAccount[]>(`${this.apiAccounts}`);
  }

  @CacheEvict(['getAccountsQuota'])
  deleteAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiAccounts}/${id}`);
  }

  @Cacheable()
  getAccountsQuota(accountId: string): Observable<IQuotaData> {
    return this.http.get<IQuotaData>(`${this.apiStorage}/${accountId}/quota`);
  }

  async upload(doc: IDocument, accountId: string): Promise<Observable<any> | undefined> {
    if (!doc.data) throw new Error('No data found to upload document.')

    const formData = new FormData();
    const data: Blob = await stringToFile(doc.data, doc.type);

    formData.append('file', data, doc.name);
    formData.append('accountId', accountId);
    formData.append('documentId', doc.id);
    return this.http.post(`${this.apiStorage}/${accountId}/files`, formData);
  }

  async chooseStorageAccount(): Promise<IStorageAccount | undefined> {
    const user = await this.authService.getLoggedInUserInfo();
    if (!user || !user.storageAccounts.length) return;

    const r = Math.floor(Math.random() * user.storageAccounts.length);
    return user.storageAccounts[r];
  }

  async getBackupCount(accountId: string): Promise<number> {
    const documents = await this.dbService.getAll(Tables.Documents);
    return documents.filter((doc: IDocument) => doc.backupAccountStorage?.accountId === accountId).length;
  }
}