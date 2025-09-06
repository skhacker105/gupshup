import { IStorageAccount } from "./storage-account.interface";

export interface User {
    id: string;
    phoneNumber: string;
    email?: string;
    password: string;
    targetLanguage: string;
    storageAccounts: IStorageAccount[];
    profilePicture?: any;
    expirationSettings?: {
        defaultPeriod: string;
        typeExpirations: { [key: string]: string };
    };
}