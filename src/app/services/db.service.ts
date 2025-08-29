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
        stores: [
            {
                name: 'users',
                keyPath: 'id',
                indexes: [{ name: 'phoneNumber', keyPath: 'phoneNumber', options: { unique: true } }]
            },
            {
                name: 'contacts',
                keyPath: 'id',
                indexes: [
                    { name: 'phoneNumber', keyPath: 'phoneNumber', options: { unique: true } },
                    { name: 'lastMessageTimestamp', keyPath: 'lastMessageTimestamp' }
                ]
            },
            {
                name: 'contactGroups',
                keyPath: 'id',
                indexes: []
            },
            {
                name: 'messages',
                keyPath: 'id',
                indexes: [
                    { name: 'receiverId', keyPath: 'receiverId' },
                    { name: 'createdAt', keyPath: 'createdAt' }
                ]
            },
            {
                name: 'documents',
                keyPath: 'id',
                indexes: [
                    { name: 'type', keyPath: 'type' },
                    { name: 'createdDate', keyPath: 'createdDate' },
                    { name: 'senderId', keyPath: 'senderId' },
                    { name: 'receiverId', keyPath: 'receiverId' },
                    { name: 'expiryDate', keyPath: 'expiryDate' }
                ]
            },
            {
                name: 'folders',
                keyPath: 'id',
                indexes: []
            }
        ]
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

    async get(store: string, id: string): Promise<any> {
        return this.manager.get(this.dbId, store, id);
    }

    async put(store: string, data: any): Promise<void> {
        await this.manager.put(this.dbId, store, data);
    }

    async delete(store: string, id: string): Promise<void> {
        await this.manager.delete(this.dbId, store, id);
    }

    async storeMessage(msg: Message): Promise<void> {
        await this.put('messages', msg);
    }

    async getAll(entity: string): Promise<any[]> {
        return this.manager.search(this.dbId, entity, {});
    }

    async storeContacts(contacts: Contact[]): Promise<void> {
        for (const contact of contacts) {
            await this.put('contacts', contact);
        }
    }

    async getUser(): Promise<User> {
        const user = await this.get('users', this.manager.getDeviceId()!);
        return user || { id: this.manager.getDeviceId()!, phoneNumber: '', password: '', targetLanguage: 'en-US', storageAccounts: [] };
    }

    async updateUser(user: User): Promise<void> {
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

    async getMessagesForReceiver(receiverId: string): Promise<Message[]> {
        const messages = await this.manager.search(this.dbId, 'messages', { receiverId });
        return messages.sort((a: Message, b: Message) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async storeDocument(doc: Document): Promise<void> {
        await this.put('documents', doc);
    }

    async getDocumentsWithFilters(filters: { groupBy?: string; orderBy?: string }): Promise<Document[]> {
        let documents = await this.manager.search(this.dbId, 'documents', {});

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
    }

    async getFolders(): Promise<{ id: string; name: string }[]> {
        return this.getAll('folders');
    }

    async createFolder(name: string): Promise<string> {
        const folder = { id: uuidv4(), name };
        await this.put('folders', folder);
        return folder.id;
    }
}