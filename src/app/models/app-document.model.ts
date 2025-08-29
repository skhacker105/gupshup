export interface AppDocument {
    id: string;
    name: string;
    mimeType: string;    // e.g. 'image/png' or 'application/pdf'
    size?: number;
    createdDate: string | Date;
    backupAccountId?: string;
    // If you prefer storing a Blob in IndexedDB, keep blob separately in 'fileBlobs' store.
  }
  