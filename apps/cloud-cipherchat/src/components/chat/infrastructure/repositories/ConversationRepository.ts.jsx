import { Conversation } from "../../domain/Conversation";
import { saveToStore, getFromStore, getAllFromStore, deleteFromStore, STORES } from "../storage/indexedDB";

export class ConversationRepository {
  async create(title: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveToStore(STORES.CONVERSATIONS, conversation);
    return conversation;
  }

  async update(id: string, updates: Partial<Conversation>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Conversation not found");

    const updated: Conversation = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveToStore(STORES.CONVERSATIONS, updated);
  }

  async getById(id: string): Promise<Conversation | undefined> {
    return getFromStore<Conversation>(STORES.CONVERSATIONS, id);
  }

  async listAll(): Promise<Conversation[]> {
    const conversations = await getAllFromStore<Conversation>(STORES.CONVERSATIONS);
    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async delete(id: string): Promise<void> {
    await deleteFromStore(STORES.CONVERSATIONS, id);
  }
}

export const conversationRepository = new ConversationRepository();