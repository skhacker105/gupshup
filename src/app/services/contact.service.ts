import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { WebSocketService } from './websocket.service';
import { Contact, ContactGroup, Tables } from '../models';
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
        return this.dbService.getAll(Tables.Contacts);
    }

    async getContactById(id: string): Promise<Contact> {
        return this.dbService.get(Tables.Contacts, id);
    }

    async deleteContact(id: string) {
        return await this.dbService.delete(Tables.Contacts, id);
    }

    async createGroup(group: ContactGroup): Promise<void> {
        return await this.dbService.put(Tables.ContactGroups, group);
    }

    async deleteGroup(id: string) {
        return await this.dbService.delete(Tables.ContactGroups, id);
    }

    async getGroups(): Promise<ContactGroup[]> {
        return await this.dbService.getAll(Tables.ContactGroups);
    }

    async updateOnlineStatus(contactId: string, online: boolean): Promise<void> {
        const contact = await this.dbService.get(Tables.Contacts, contactId) as Contact;
        if (contact) {
            contact.online = online;
            await this.dbService.put(Tables.Contacts, contact);
        }
    }

    async storeContact(contact: Contact): Promise<void> {
        await this.dbService.put(Tables.Contacts, contact);
    }

    storeContacts(contacts: Contact[]): Promise<void>[] {
        return contacts.map(c => this.dbService.put(Tables.Contacts, c))
    }
}