import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../models/document.interface';
import { User } from '../models/user.interface';
import { ISearchQuery, MultiDBManager } from '../core/indexeddb-handler';
import { Tables } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DbService {
    private manager: MultiDBManager;
    private dbId = 'chatAppDB';
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
                    "company",
                    "lastMessageTimestamp",
                    "createdAt",
                    "updatedAt",
                    "favorite"
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
                    "backupAccountId",
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

    constructor() {
        this.manager = new MultiDBManager();
        if (!this.manager.getDeviceId()) {
            const deviceId = uuidv4();
            this.manager.setDeviceId(deviceId);
        }
        this.manager.createDatabaseAsCreator(this.dbId, this.schema).catch(err => console.error('DB Creation Error:', err));
        this.checkExpirations();
    }

    async search(store: string, query: ISearchQuery): Promise<any[]> {
        return await this.manager.search(this.dbId, store, query);
    }

    async get(store: string, id: string): Promise<any> {
        return this.manager.get(this.dbId, store, id);
    }

    async getAll(store: string): Promise<any[]> {
        return this.manager.getAll(this.dbId, store);
    }

    async put(store: string, data: any): Promise<void> {
        return await this.manager.put(this.dbId, store, data);
    }

    async delete(store: string, id: string): Promise<void> {
        return await this.manager.delete(this.dbId, store, id);
    }

    getDeviceId(): string {
        // Replace with actual device ID logic (e.g., UUID from localStorage or device fingerprint)
        return 'device-id-stub-' + Date.now(); // Stub for testing
    }

    async getUser(userId: string): Promise<User | undefined> {
        const user = await this.get('users', userId);
        return user; // || { id: this.manager.getDeviceId()!, phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
    }

    // async getUser(): Promise<User | undefined> {
    //     const user = await this.get('users', this.manager.getDeviceId()!);
    //     return user || { id: this.manager.getDeviceId()!, phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
    // }

    async updateUser(user: Partial<User>): Promise<void> {
        return await this.put('users', user);
    }

    checkExpirations(): void {
        setInterval(async () => {
            const documents: Document[] = await this.getAll(Tables.Documents);
            const expired = documents.filter(doc => doc.expiryDate && doc.expiryDate < new Date());
            for (const doc of expired) {
                await this.delete(Tables.Documents, doc.id);
            }
        }, 3600000); // Run hourly
    }
}