export interface Document {
    id: string;
    name: string;
    type: string;
    data: Blob;
    senderId: string;
    receiverId: string;
    createdDate: Date;
    expiryDate?: Date;
    folderId?: string;
    backupAccountId?: string;
}