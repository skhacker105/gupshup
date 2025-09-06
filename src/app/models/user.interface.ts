export interface User {
    id: string;
    phoneNumber: string;
    email?: string;
    password: string;
    targetLanguage: string;
    storageAccounts: {
        id: string;
        provider: string;
        label: string;
        createdAt: Date;
        userId: string;
    }[];
    profilePicture?: any;
    expirationSettings?: {
        defaultPeriod: string;
        typeExpirations: { [key: string]: string };
    };
}