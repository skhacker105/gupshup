import { Document } from './';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  file?: Document;
  status: string;
  replyTo?: string;
  createdAt: Date;
  translatedText?: string;
}