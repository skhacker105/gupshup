export interface OAuthResponse {
    status: 'success' | 'error';
    userId?: string;
    account?: any;
    timestamp?: string;
    message?: string;
    error?: string;
}