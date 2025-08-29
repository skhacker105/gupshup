import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { StorageAccountService } from './storage-account.service';
import { Document } from '../models/document.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private dbService: DbService,
    private storageService: StorageAccountService
  ) { }

  async getDocuments(filters: { groupBy?: string; orderBy?: string }): Promise<Document[]> {
    return this.dbService.getDocumentsWithFilters(filters);
  }

  async backupDocument(doc: Document, accountId: string): Promise<void> {
    if (!accountId) {
      throw new Error('No storage account selected');
    }
    await this.storageService.upload(doc, accountId);
    doc.backupAccountId = accountId;
    await this.dbService.storeDocument(doc);
  }

  async deleteDocument(id: string, permanent: boolean): Promise<void> {
    const doc = await this.dbService.get('documents', id) as Document;
    if (permanent && doc.backupAccountId) {
      // Requires backend route
      // await this.storageService.deleteBackup(doc.id, doc.backupAccountId);
    }
    await this.dbService.delete('documents', id);
  }

  async createFolder(name: string): Promise<string> {
    return this.dbService.createFolder(name);
  }
}