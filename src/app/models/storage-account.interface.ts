export interface StorageAccount {
    id: string;
    provider: 'google'; // For now
    label: string;
    status: 'pending' | 'connected';
    createdAt: Date;
}