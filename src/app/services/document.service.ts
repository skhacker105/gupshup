import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DbService, StorageAccountService } from './';
import { Document } from '../models/document.interface';
import { Tables } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private dbService: DbService,
    private storageService: StorageAccountService
  ) { }

  async saveNewDocuments(doc: Document) {
    this.dbService.put(Tables.Documents, doc);
  }

  async getDocuments(filters: { groupBy?: string; orderBy?: string }): Promise<Document[]> {
    let documents = await this.dbService.getAll(Tables.Documents);
    if (filters.orderBy) {
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

    if (filters.groupBy) {
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
    // return this.dbService.getDocumentsWithFilters(filters);
  }

  async backupDocument(doc: Document, accountId: string): Promise<void> {
    if (!accountId) {
      throw new Error('No storage account selected');
    }
    await this.storageService.upload(doc, accountId);
    doc.backupAccountId = accountId;
    await this.dbService.put(Tables.Folders, doc);
  }

  async deleteDocument(id: string, permanent: boolean): Promise<void> {
    const doc = await this.dbService.get('documents', id) as Document;
    if (permanent && doc.backupAccountId) {
      // Requires backend route
      // await this.storageService.deleteBackup(doc.id, doc.backupAccountId);
    }
    await this.dbService.delete('documents', id);
  }

  async getFolders(): Promise<any[]> {
    return this.dbService.getAll(Tables.Folders);
  }

  async createFolder(name: string): Promise<void> {
    const folder = { id: uuidv4(), name };
    this.dbService.put(Tables.Folders, folder);
  }
}