import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IMessage, Tables } from '../models';
import { AuthService, ContactService, DbService, TranslationService, WebSocketService } from './';
import { ISearchQuery } from '../core/indexeddb-handler';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private messageSubject = new Subject<IMessage>();

    constructor(
        private wsService: WebSocketService,
        private dbService: DbService,
        private translationService: TranslationService,
        private contactService: ContactService,
        private authService: AuthService
    ) {
        this.wsService.messages$.subscribe(msg => {
            if (msg.type === 'message') {
                this.messageSubject.next(msg.data as IMessage);
            }
        });
    }

    getMessages(): Observable<IMessage> {
        return this.messageSubject.asObservable();
    }

    async sendMessage(msg: IMessage): Promise<void> {
        // if (msg.text) {
        //     const user = await this.authService.getLoggedInUserInfo();
        //     if (!user) return;

        //     const translated = await this.translationService.translate(msg.text, 'auto', user.targetLanguage);
        //     msg.translatedText = translated;
        // }
        await this.dbService.put(Tables.Messages, msg);
        // this.wsService.send({ type: 'message', data: msg });
        this.messageSubject.next(msg);
    }

    deleteMessage(messageId: string): Promise<void> {
        return this.dbService.delete(Tables.Messages, messageId);
    }

    async getAllMessageByUser(userId: string): Promise<IMessage[]> {
        const query1: ISearchQuery = { text: userId ?? '', fields: ['receiverId'] }
        const messages1 = await this.dbService.search(Tables.Messages, query1);

        const query2: ISearchQuery = { text: userId ?? '', fields: ['senderId'] }
        const messages2 = await this.dbService.search(Tables.Messages, query2);

        return [...messages1, ...messages2]
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