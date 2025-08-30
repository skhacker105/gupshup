export interface ContactGroup {
    id: string;
    name: string;
    members: string[]; // Contact IDs
    lastMessageTimestamp?: Date;
}