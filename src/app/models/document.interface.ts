export interface IDocument {
    id: string;
    name: string;
    type: string;
    data: string;
    senderId: string;
    receiverId: string;
    createdDate: Date;
    expiryDate?: Date;
    folderId?: string;
    backupAccountId?: string;
    relativePath?: string; // Relative to user's folder structure
    parentFolderId?: string;
}
