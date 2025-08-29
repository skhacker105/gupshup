export interface User {
    id: string;
    phoneNumber: string;
    email?: string;
    password: string;
    targetLanguage: string;
    storageAccounts: string[];
    expirationSettings?: {
        defaultPeriod: string;
        typeExpirations: { [key: string]: string };
    };
}