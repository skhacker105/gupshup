export interface FileMeta {
    id: string;
    name: string;
    type: string;
    size?: number;
    createdAt: string | Date;
    expiresAt?: string | Date;
    storageAccountId?: string;
}
