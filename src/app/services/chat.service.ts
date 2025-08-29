import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../models';
import { WebSocketService } from './websocket.service';
import { DbService } from './db.service';
import { TranslationService } from './translation.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private messageSubject = new Subject<Message>();

    constructor(
        private wsService: WebSocketService,
        private dbService: DbService,
        private translationService: TranslationService
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
        await this.dbService.storeMessage(msg);
        this.wsService.send({ type: 'message', data: msg });
        this.messageSubject.next(msg);
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
        await this.dbService.storeContacts(mapped);
    }
}