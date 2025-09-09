export interface IDocument {
    id: string;
    name: string;
    type: string;
    data?: string;
    senderId: string;
    receiverId: string;
    createdDate: Date;
    expiryDate?: Date;
    backupAccountStorage?: IDocumentStorage;
    relativePath?: string;
    parentFolderId?: string;
}

export interface IDocumentStorage {
    accountId: string;
    fileId: string;
}
