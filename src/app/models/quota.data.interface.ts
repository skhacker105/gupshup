export interface IQuotaData {
    storageQuota: {
        limit: number,
        usage: number,
        usageInDrive: number,
        usageInDriveTrash: number
    },
    totalBytes: number,
    usedBytes: number,
    availableBytes: number;
    usagePercentage?: number;
}