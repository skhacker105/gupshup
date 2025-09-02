import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DbService, StorageAccountService } from './';
import { Document } from '../models/document.interface';
import { Folder } from '../models/folder.interface';
import { Tables } from '../models';
import { ISearchQuery } from '../core/indexeddb-handler';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private dbService: DbService,
    private storageService: StorageAccountService
  ) { }

  async saveNewDocuments(doc: Document, parentFolder?: Folder) {
    doc.relativePath = await this.buildRelativePath(parentFolder, doc.name, doc.id);
    return await this.dbService.put(Tables.Documents, doc);
  }

  async getDocuments(parentFolderId?: string, filters?: { groupBy?: string; orderBy?: string }): Promise<Document[]> {
    const query: ISearchQuery = { text: parentFolderId ?? '', fields: ['parentFolderId'] };
    let documents = await this.dbService.search(Tables.Documents, query);
    if (filters?.orderBy) {
      documents = documents.sort((a: Document, b: Document) => {
        switch (filters.orderBy) {
          case 'date':
            return b.createdDate.getTime() - a.createdDate.getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          case 'sender':
            return a.senderId.localeCompare(b.senderId);
          case 'receiver':
            return a.receiverId.localeCompare(b.receiverId);
          default:
            return 0;
        }
      });
    }

    if (filters?.groupBy) {
      const grouped: { [key: string]: Document[] } = documents.reduce((acc: any, doc: Document) => {
        let key: string;
        switch (filters.groupBy) {
          case 'type':
            key = doc.type;
            break;
          case 'month':
            key = doc.createdDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            break;
          case 'sender':
            key = doc.senderId;
            break;
          case 'receiver':
            key = doc.receiverId;
            break;
          case 'contact':
            key = doc.senderId + '|' + doc.receiverId;
            break;
          default:
            key = doc.createdDate.toISOString().split('T')[0];
        }
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
      }, {});
      return Object.entries(grouped).flatMap(([key, docs]) =>
        docs.map(doc => ({ ...doc, groupKey: key }))
      );
    }
    return documents;
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
      relativePath: await this.buildRelativePath(parentFolder, name, id)
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