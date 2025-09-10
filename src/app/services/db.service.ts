import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { IDocument } from '../models/document.interface';
import { User } from '../models/user.interface';
import { ISearchQuery, MultiDBManager } from '../core/indexeddb-handler';
import { Tables } from '../models';
import { EMPTY_FILE } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class DbService {
    private manager?: MultiDBManager;
    private dbId = 'GupShupAppDB';
    private schema = {
        "version": 1,
        "stores": {
            "users": {
                "keyPath": "id",
                "indexes": [
                    { "name": "phoneNumber", "keyPath": "phoneNumber", "options": { "unique": true } },
                    { "name": "email", "keyPath": "email" },
                    { "name": "username", "keyPath": "username" }
                ],
                "secureIndex": [
                    "phoneNumber",
                    "email",
                    "username",
                    "firstName",
                    "lastName",
                    "profilePicture",
                    "status",
                    "createdAt",
                    "updatedAt",
                    "password"
                ]
            },
            "contacts": {
                "keyPath": "id",
                "indexes": [
                    { "name": "phoneNumber", "keyPath": "phoneNumber", "options": { "unique": true } },
                    { "name": "lastMessageTimestamp", "keyPath": "lastMessageTimestamp" },
                    { "name": "name", "keyPath": "name" }
                ],
                "secureIndex": [
                    "phoneNumber",
                    "name",
                    "email",
                    "address",
                    "lastMessageTimestamp",
                    "createdAt",
                    "updatedAt"
                ]
            },
            "contactGroups": {
                "keyPath": "id",
                "indexes": [
                    { "name": "name", "keyPath": "name" }
                ],
                "secureIndex": [
                    "name",
                    "description",
                    "createdBy",
                    "createdAt",
                    "updatedAt",
                    "memberCount"
                ]
            },
            "messages": {
                "keyPath": "id",
                "indexes": [
                    { "name": "receiverId", "keyPath": "receiverId" },
                    { "name": "senderId", "keyPath": "senderId" },
                    { "name": "createdAt", "keyPath": "createdAt" },
                    { "name": "status", "keyPath": "status" }
                ],
                "secureIndex": [
                    "senderId",
                    "receiverId",
                    "text",
                    "status",
                    "replyTo"
                ]
            },
            "documents": {
                "keyPath": "id",
                "indexes": [
                    { "name": "type", "keyPath": "type" },
                    { "name": "createdDate", "keyPath": "createdDate" },
                    { "name": "senderId", "keyPath": "senderId" },
                    { "name": "receiverId", "keyPath": "receiverId" },
                    { "name": "expiryDate", "keyPath": "expiryDate" },
                    { "name": "title", "keyPath": "title" }
                ],
                "secureIndex": [
                    "type",
                    "name",
                    "senderId",
                    "receiverId",
                    "createdDate",
                    "expiryDate",
                    "folderId",
                    "relativePath",
                    "parentFolderId"
                ]
            },
            "folders": {
                "keyPath": "id",
                "indexes": [
                    { "name": "name", "keyPath": "name" },
                    { "name": "createdBy", "keyPath": "createdBy" }
                ],
                "secureIndex": [
                    "name",
                    "description",
                    "createdBy",
                    "createdAt",
                    "updatedAt",
                    "parentFolderId"
                ]
            }
        }
    };
    private expiryTimeOut: number | null = null;

    constructor() {
    }

    initializeDB(user: User) {
        this.manager = new MultiDBManager();
        this.dbId = this.dbId + user.phoneNumber;
        if (!this.manager.getDeviceId()) {
            const deviceId = user.id;
            this.manager.setDeviceId(deviceId);
        }
        this.manager.createDatabaseAsCreator(this.dbId, this.schema).catch(err => console.error('DB Creation Error:', err));
        this.checkExpirations();
    }

    async search(store: string, query: ISearchQuery): Promise<any[]> {
        return (await this.manager?.search(this.dbId, store, query)) ?? [];
    }

    async get(store: string, id: string): Promise<any> {
        return this.manager?.get(this.dbId, store, id);
    }

    async getAll(store: string): Promise<any[]> {
        return (await this.manager?.getAll(this.dbId, store)) ?? [];
    }

    async put(store: string, data: any): Promise<void> {
        return await this.manager?.put(this.dbId, store, data);
    }

    async delete(store: string, id: string): Promise<void> {
        return await this.manager?.delete(this.dbId, store, id);
    }

    async getUser(userId: string): Promise<User | undefined> {
        const user = await this.get('users', userId);
        return user;
    }

    async updateUser(user: Partial<User>): Promise<void> {
        return await this.put('users', user);
    }

    checkExpirations(): void {
        this.expiryTimeOut = window.setInterval(() => this.deleteExpiredDocuments(), 3600000); // Run hourly
    }

    async deleteExpiredDocuments() {
        const documents: IDocument[] = await this.getAll(Tables.Documents);
        const expired = documents.filter(doc => doc.expiryDate && new Date(doc.expiryDate) < new Date());
        for (const doc of expired) {
            if (doc.backupAccountStorage) {
                doc.data = EMPTY_FILE;
                await this.put(Tables.Documents, doc);
            } else {
                await this.delete(Tables.Documents, doc.id);
            }
        }
    }

    deInitializeDB() {
        this.manager?.destructor();
        this.manager = undefined;
        if (this.expiryTimeOut)
            window.clearInterval(this.expiryTimeOut);
        this.dbId = 'GupShupAppDB';
    }
}