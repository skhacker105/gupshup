export interface Folder {
    id: string;
    name: string;
    type: 'folder';
    relativePath: string; // Changed to required field
    parentFolderId?: string;
    createdDate: Date;
}