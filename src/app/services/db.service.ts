import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../models/message.interface';
import { Contact } from '../models/contact.interface';
import { Document } from '../models/document.interface';
import { User } from '../models/user.interface';
import { MultiDBManager } from '../core/indexeddb-handler';

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
                    "updatedAt"
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
                    "receiverId",
                    "senderId",
                    "content",
                    "attachments",
                    "createdAt",
                    "updatedAt",
                    "status",
                    "messageType",
                    "isRead",
                    "isDeleted"
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
                    "title",
                    "content",
                    "fileSize",
                    "filePath",
                    "mimeType",
                    "senderId",
                    "receiverId",
                    "createdDate",
                    "updatedDate",
                    "expiryDate",
                    "tags",
                    "status"
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

    async search(store: string, query: any): Promise<Message[]> {
        return await this.manager.search(this.dbId, store, query);
    }

    async get(store: string, id: string): Promise<any> {
        return this.manager.get(this.dbId, store, id);
    }

    async getAll(entity: string): Promise<any[]> {
        return this.manager.getAll(this.dbId, entity);
    }

    async put(store: string, data: any): Promise<void> {
        await this.manager.put(this.dbId, store, data);
    }

    async delete(store: string, id: string): Promise<void> {
        await this.manager.delete(this.dbId, store, id);
    }

    getDeviceId(): string {
        // Replace with actual device ID logic (e.g., UUID from localStorage or device fingerprint)
        return 'device-id-stub-' + Date.now(); // Stub for testing
    }

    async getUser(): Promise<User> {
        const user = await this.get('users', this.manager.getDeviceId()!);
        return user || { id: this.manager.getDeviceId()!, phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
    }

    async updateUser(user: Partial<User>): Promise<void> {
        await this.put('users', user);
    }

    checkExpirations(): void {
        setInterval(async () => {
            const documents: Document[] = await this.getAll('documents');
            const expired = documents.filter(doc => doc.expiryDate && doc.expiryDate < new Date());
            for (const doc of expired) {
                await this.delete('documents', doc.id);
            }
        }, 3600000); // Run hourly
    }
}