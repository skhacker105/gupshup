import { IQuotaData } from "./";

export interface IStorageAccount {
    id: string;
    provider: 'google'; // For now
    label: string;
    createdAt: Date;
    quota?: IQuotaData;
    userId: string;
}