import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Message, Tables } from '../models';
import { ContactService, DbService, TranslationService, WebSocketService } from './';
import { ISearchQuery } from '../core/indexeddb-handler';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private messageSubject = new Subject<Message>();

    constructor(
        private wsService: WebSocketService,
        private dbService: DbService,
        private translationService: TranslationService,
        private contactService: ContactService
    ) {
        this.wsService.messages$.subscribe(msg => {
            if (msg.type === 'message') {
                this.messageSubject.next(msg.data as Message);
            }
        });
    }

    getMessages(): Observable<Message> {
        return this.messageSubject.asObservable();
    }

    async sendMessage(msg: Message): Promise<void> {
        if (msg.text) {
            const user = await this.dbService.getUser();
            const translated = await this.translationService.translate(msg.text, 'auto', user.targetLanguage);
            msg.translatedText = translated;
        }
        await this.dbService.put(Tables.Messages, msg);
        this.wsService.send({ type: 'message', data: msg });
        this.messageSubject.next(msg);
    }

    async getAllMessageByUser(receiverId: string): Promise<Message[]> {
        const query: ISearchQuery = { text: receiverId ?? '', fields: ['receiverId'] }
        return this.dbService.search(Tables.Messages, query);
    }

    async syncContacts(): Promise<void> {
        // Mock contacts for now, as navigator.contacts is experimental
        const mockContacts = [
            { id: uuidv4(), name: 'John Doe', tel: ['+1234567890'] },
            { id: uuidv4(), name: 'Jane Smith', tel: ['+0987654321'] }
        ];
        const mapped = mockContacts.map(c => ({
            id: c.tel[0],
            name: c.name,
            phoneNumber: c.tel[0],
            online: false,
            lastMessageTimestamp: new Date()
        }));
        await this.contactService.storeContacts(mapped);
    }
}