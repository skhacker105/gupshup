export interface Contact {
    id: string;
    phoneNumber: string;
    name: string;
    lastMessageTimestamp?: Date;
    online: boolean;
}