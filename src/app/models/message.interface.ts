import { Document } from './';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  documentId?: string;
  status: string;
  replyTo?: string;
  createdAt: Date;
  translatedText?: string;
  isDeleted?: string;
  isRead?: boolean;
}