import { Document } from './';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  file?: Document;
  createdAt: Date;
  translatedText?: string;
}