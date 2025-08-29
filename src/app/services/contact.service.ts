import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { WebSocketService } from './websocket.service';
import { Contact, ContactGroup } from '../models';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private sub?: Subscription;

    constructor(
        private dbService: DbService,
        private wsService: WebSocketService
    ) {
        this.sub = this.wsService.messages$.subscribe(msg => {
            if (msg.type === 'presence') {
                this.updateOnlineStatus(msg.contactId, msg.online);
            }
        });
    }

    async getContacts(): Promise<Contact[]> {
        return this.dbService.getAll('contacts');
    }

    async getAll(collection: string): Promise<any[]> {
        return await this.dbService.getAll(collection);
    }

    async createGroup(group: ContactGroup): Promise<void> {
        await this.dbService.put('contactGroups', group);
    }

    async updateOnlineStatus(contactId: string, online: boolean): Promise<void> {
        const contact = await this.dbService.get('contacts', contactId) as Contact;
        if (contact) {
            contact.online = online;
            await this.dbService.put('contacts', contact);
        }
    }
}