import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { AuthService, DbService, StorageAccountService } from './';
import { IDocument } from '../models/document.interface';
import { Folder } from '../models/folder.interface';
import { ExpirationPeriod, IconSize, Tables } from '../models';
import { ISearchQuery } from '../core/indexeddb-handler';
import { Browser } from '@capacitor/browser'; // For mobile app PDF viewing
import { Platform } from '@angular/cdk/platform'; // To detect platform
import { stringToFile } from '../core/indexeddb-handler/utils/file';
import { SupportedFileTypes } from '../constants';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly MIME_TYPE_MAP: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
    'image/gif': 'GIF Image',
    'text/plain': 'Text',
    'text/csv': 'CSV',
    // Add more MIME types as needed
  };

  selectedIconSizeStoreKey = 'selectedIconSize';
  selectedGroupByStoreKey = 'groupBy';
  selectedOrderByStoreKey = 'orderBy';


  set selectedIconSize(val: IconSize) {
    if (val)
      localStorage.setItem(this.selectedIconSizeStoreKey, val);
    else
      localStorage.removeItem(this.selectedIconSizeStoreKey);
  }

  get selectedIconSize(): IconSize {
    return localStorage.getItem(this.selectedIconSizeStoreKey) as IconSize ?? IconSize.Medium
  }


  set selectedGroupBy(val: string) {
    if (val)
      localStorage.setItem(this.selectedGroupByStoreKey, val);
    else
      localStorage.removeItem(this.selectedGroupByStoreKey);
  }

  get selectedGroupBy(): string {
    return localStorage.getItem(this.selectedGroupByStoreKey) ?? '';
  }


  set selectedOrderBy(val: string) {
    if (val)
      localStorage.setItem(this.selectedOrderByStoreKey, val);
    else
      localStorage.removeItem(this.selectedOrderByStoreKey);
  }

  get selectedOrderBy(): string {
    return localStorage.getItem(this.selectedOrderByStoreKey) ?? '';
  }

  constructor(
    private dbService: DbService,
    private authService: AuthService,
    private storageService: StorageAccountService,
    private platform: Platform
  ) { }

  async saveNewDocuments(doc: IDocument, parentFolder?: Folder) {
    await this.dbService.deleteExpiredDocuments();

    doc.relativePath = this.buildRelativePath(parentFolder, doc.name, doc.id);
    doc.expiryDate = await this.calculateExpiryDate(doc.type);
    return await this.dbService.put(Tables.Documents, doc);
  }

  async getDocument(documentId: string): Promise<IDocument> {
    await this.dbService.deleteExpiredDocuments();

    return this.dbService.get(Tables.Documents, documentId);
  }

  async getDocuments(parentFolderId?: string): Promise<IDocument[]> {
    await this.dbService.deleteExpiredDocuments();

    const query: ISearchQuery = { text: parentFolderId ?? '', fields: ['parentFolderId'] };
    return this.dbService.search(Tables.Documents, query);
  }

  async getGroupedDocuments(groupBy: string, orderBy: string): Promise<{ groupKey: string, documents: IDocument[] }[]> {
    await this.dbService.deleteExpiredDocuments();
    
    let documents = await this.dbService.getAll(Tables.Documents);
    const sortFn = (a: IDocument, b: IDocument) => {
      switch (orderBy) {
        case 'createdDate':
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'senderId':
          return a.senderId.localeCompare(b.senderId);
        case 'receiverId':
          return a.receiverId.localeCompare(b.receiverId);
        default:
          return 0;
      }
    };
    const grouped: { [key: string]: IDocument[] } = documents.reduce((acc: any, doc: IDocument) => {
      let key: string;
      switch (groupBy) {
        case 'type':
          key = this.MIME_TYPE_MAP[doc.type] || doc.type.split('/').pop() || 'Unknown';
          break;
        case 'month':
          key = new Date(doc.createdDate).toLocaleString('default', { month: 'long', year: 'numeric' });
          break;
        case 'sender':
          key = doc.senderId;
          break;
        case 'receiver':
          key = doc.receiverId;
          break;
        default:
          key = 'Unknown';
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});
    if (orderBy) {
      for (const key in grouped) {
        grouped[key] = grouped[key].sort(sortFn);
      }
    }
    return Object.entries(grouped).map(([groupKey, documents]) => ({ groupKey, documents }));
  }

  async backupDocument(doc: IDocument): Promise<any> {
    await this.dbService.deleteExpiredDocuments();

    return new Promise(async (resolve) => {
      const account = await this.storageService.chooseStorageAccount();
      if (!account) {
        resolve(undefined);
        return;
      }

      const obs = await this.storageService.upload(doc, account.id)
      obs?.pipe(take(1)).subscribe(async (res) => {
        doc.backupAccountStorage = {
          accountId: account.id,
          fileId: res.id
        };

        await this.dbService.put(Tables.Documents, doc);
        resolve({ ...res, storageAccount: doc.backupAccountStorage })
      })
    })
  }

  async deleteDocument(id: string): Promise<void> {
    await this.dbService.deleteExpiredDocuments();

    // const doc = await this.dbService.get(Tables.Documents, id) as IDocument;
    // if (permanent && doc.backupAccountId) {
    // Requires backend route
    // await this.storageService.deleteBackup(doc.id, doc.backupAccountId);
    // }
    await this.dbService.delete(Tables.Documents, id);
  }

  async openDocument(doc: IDocument): Promise<void> {
    await this.dbService.deleteExpiredDocuments();
    
    if (!doc.data) return;
    
    // Extract file extension (case-insensitive)
    const extension = doc.name.split('.').pop()?.toLowerCase();

    // Check if the file type is supported
    if (!extension || !SupportedFileTypes[extension]) {
      throw new Error(`Unsupported file type: ${extension || 'unknown'}.`);
    }

    try {
      // Fetch document data (assumes documentService.getDocumentData returns a Blob)
      const blob = await stringToFile(doc.data, doc.type)

      // Ensure the Blob has the correct MIME type
      const mimeType = SupportedFileTypes[extension];
      const fileBlob = new Blob([blob], { type: mimeType });

      if (this.platform.ANDROID || this.platform.IOS) {
        // Mobile: Use Capacitor Browser to open the file in a native viewer/app
        const blobUrl = URL.createObjectURL(fileBlob);
        await Browser.open({ url: blobUrl });
        // Note: The URL will be revoked automatically after use in mobile context
      } else {
        // Browser: Open file in a new tab
        const blobUrl = URL.createObjectURL(fileBlob);
        window.open(blobUrl, '_blank');
        // Revoke the URL after a short delay to ensure the browser has loaded it
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (err) {
      throw new Error(`Failed to open document: ${doc.name}`);
    }
  }

  async deleteFolder(id: string): Promise<void> {
    await this.dbService.deleteExpiredDocuments();

    return await this.dbService.delete(Tables.Folders, id);
  }

  async getFolder(folderId: string): Promise<Folder | undefined> {
    await this.dbService.deleteExpiredDocuments();

    return this.dbService.get(Tables.Folders, folderId);
  }

  async getFolders(parentFolderId?: string): Promise<Folder[]> {
    await this.dbService.deleteExpiredDocuments();

    const query: ISearchQuery = { text: parentFolderId ?? '', fields: ['parentFolderId'] };
    return this.dbService.search(Tables.Folders, query);
  }

  async createFolder(name: string, parentFolder?: Folder): Promise<void> {
    await this.dbService.deleteExpiredDocuments();

    const id = uuidv4();
    const folder: Folder = {
      id,
      name,
      type: 'folder',
      parentFolderId: parentFolder?.id,
      relativePath: await this.buildRelativePath(parentFolder, name, id),
      createdDate: new Date() // Added for sorting support
    };
    return await this.dbService.put(Tables.Folders, folder);
  }

  buildRelativePath(parentFolder: Folder | undefined, name: string, id: string): string {
    const pathSegment = { name, id };
    if (!parentFolder) {
      return JSON.stringify([pathSegment]);
    }
    const parentPath = JSON.parse(parentFolder.relativePath || '[]');
    return JSON.stringify([...parentPath, pathSegment]);
  }

  async calculateExpiryDate(fileType: string): Promise<Date | undefined> {
    const user = await this.authService.getLoggedInUserInfo();
    if (!user) return;

    const settings = user.expirationSettings || { defaultPeriod: ExpirationPeriod.OneWeek, typeExpirations: {} };
    const period = settings.typeExpirations[fileType.split('/')[0]] || settings.defaultPeriod;
    const now = new Date();
    switch (period) {
      case ExpirationPeriod.OneMinute:
        return new Date(now.getTime() + 60 * 1000); // +1 minute
      case ExpirationPeriod.OneHour:
        return new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
      case ExpirationPeriod.OneDay:
        return new Date(now.setDate(now.getDate() + 1)); // +1 day
      case ExpirationPeriod.OneWeek:
        return new Date(now.setDate(now.getDate() + 7)); // +1 week
      case ExpirationPeriod.OneMonth:
        return new Date(now.setMonth(now.getMonth() + 1)); // +1 month
      case ExpirationPeriod.OneYear:
        return new Date(now.setFullYear(now.getFullYear() + 1)); // +1 year
      case ExpirationPeriod.Immediate:
        return new Date(now.getTime() + 300 * 1000); // ~immediate, 30 sec grace
      default:
        return undefined;
    }
  }
}