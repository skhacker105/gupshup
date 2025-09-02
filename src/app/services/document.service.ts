import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DbService, StorageAccountService } from './';
import { Document } from '../models/document.interface';
import { Folder } from '../models/folder.interface';
import { IconSize, Tables } from '../models';
import { ISearchQuery } from '../core/indexeddb-handler';

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
    private storageService: StorageAccountService
  ) { }

  async saveNewDocuments(doc: Document, parentFolder?: Folder) {
    doc.relativePath = await this.buildRelativePath(parentFolder, doc.name, doc.id);
    return await this.dbService.put(Tables.Documents, doc);
  }

  async getDocuments(parentFolderId?: string): Promise<Document[]> {
    const query: ISearchQuery = { text: parentFolderId ?? '', fields: ['parentFolderId'] };
    return this.dbService.search(Tables.Documents, query);
  }

  async getGroupedDocuments(groupBy: string, orderBy: string): Promise<{ groupKey: string, documents: Document[] }[]> {
    let documents = await this.dbService.getAll(Tables.Documents);
    const sortFn = (a: Document, b: Document) => {
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
    const grouped: { [key: string]: Document[] } = documents.reduce((acc: any, doc: Document) => {
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

  async backupDocument(doc: Document, accountId: string): Promise<void> {
    if (!accountId) {
      throw new Error('No storage account selected');
    }
    await this.storageService.upload(doc, accountId);
    doc.backupAccountId = accountId;
    await this.dbService.put(Tables.Documents, doc);
  }

  async deleteDocument(id: string, permanent: boolean): Promise<void> {
    const doc = await this.dbService.get('documents', id) as Document;
    if (permanent && doc.backupAccountId) {
      // Requires backend route
      // await this.storageService.deleteBackup(doc.id, doc.backupAccountId);
    }
    await this.dbService.delete('documents', id);
  }

  async deleteFolder(id: string): Promise<void> {
    await this.dbService.delete(Tables.Folders, id);
  }

  async getFolder(folderId: string): Promise<Folder | undefined> {
    return this.dbService.get(Tables.Folders, folderId);
  }

  async getFolders(parentFolderId?: string): Promise<Folder[]> {
    const query: ISearchQuery = { text: parentFolderId ?? '', fields: ['parentFolderId'] };
    return this.dbService.search(Tables.Folders, query);
  }

  async createFolder(name: string, parentFolder?: Folder): Promise<void> {
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

  async buildRelativePath(parentFolder: Folder | undefined, name: string, id: string): Promise<string> {
    const pathSegment = { name, id };
    if (!parentFolder) {
      return JSON.stringify([pathSegment]);
    }
    const parentPath = JSON.parse(parentFolder.relativePath || '[]');
    return JSON.stringify([...parentPath, pathSegment]);
  }

  async calculateExpiryDate(fileType: string): Promise<Date | undefined> {
    const user = await this.dbService.getUser();
    const settings = user.expirationSettings || { defaultPeriod: '1week', typeExpirations: {} };
    const period = settings.typeExpirations[fileType.split('/')[0]] || settings.defaultPeriod;
    const now = new Date();
    switch (period) {
      case '1week': return new Date(now.setDate(now.getDate() + 7));
      case '1month': return new Date(now.setMonth(now.getMonth() + 1));
      case 'immediate': return new Date(now.getTime() + 60000);
      default: return undefined;
    }
  }
}