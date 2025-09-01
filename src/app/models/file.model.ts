export interface FileMeta {
    id: string;
    name: string;
    mimeType: string;
    size?: number;
    createdAt: string | Date;
    expiresAt?: string | Date;
    storageAccountId?: string;
}