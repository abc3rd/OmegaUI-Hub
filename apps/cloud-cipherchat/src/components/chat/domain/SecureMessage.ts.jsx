export interface SecureMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  cipherText: string;  
  createdAt: string;
  metadata?: {
    tokens?: number;
    provider?: string;
    model?: string;
  };
}

export interface DecryptedMessage extends Omit<SecureMessage, 'cipherText'> {
  content: string;
}