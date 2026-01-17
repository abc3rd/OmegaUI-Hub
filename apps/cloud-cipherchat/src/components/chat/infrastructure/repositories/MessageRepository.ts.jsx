import { SecureMessage, DecryptedMessage } from "../../domain/SecureMessage";
import { encryptMessage, decryptMessage } from "../encryption/crypto";
import { saveToStore, getByIndex, deleteFromStore, STORES } from "../storage/indexedDB";

export class MessageRepository {
  async create(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: SecureMessage['metadata']
  ): Promise<SecureMessage> {
    const cipherText = await encryptMessage(content);

    const message: SecureMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role,
      cipherText,
      createdAt: new Date().toISOString(),
      metadata,
    };

    await saveToStore(STORES.MESSAGES, message);
    return message;
  }

  async listByConversation(conversationId: string): Promise<SecureMessage[]> {
    const messages = await getByIndex<SecureMessage>(
      STORES.MESSAGES,
      "conversationId",
      conversationId
    );

    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async decryptMessages(messages: SecureMessage[]): Promise<DecryptedMessage[]> {
    return Promise.all(
      messages.map(async (msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role,
        content: await decryptMessage(msg.cipherText),
        createdAt: msg.createdAt,
        metadata: msg.metadata,
      }))
    );
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    const messages = await this.listByConversation(conversationId);
    await Promise.all(messages.map(msg => deleteFromStore(STORES.MESSAGES, msg.id)));
  }
}

export const messageRepository = new MessageRepository();