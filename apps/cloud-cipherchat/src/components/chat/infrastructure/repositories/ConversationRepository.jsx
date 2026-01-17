import { saveToStore, getFromStore, getAllFromStore, deleteFromStore, STORES } from "../storage/indexedDB";

export class ConversationRepository {
  async create(title) {
    const conversation = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveToStore(STORES.CONVERSATIONS, conversation);
    return conversation;
  }

  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Conversation not found");

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveToStore(STORES.CONVERSATIONS, updated);
  }

  async getById(id) {
    return getFromStore(STORES.CONVERSATIONS, id);
  }

  async listAll() {
    const conversations = await getAllFromStore(STORES.CONVERSATIONS);
    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async delete(id) {
    await deleteFromStore(STORES.CONVERSATIONS, id);
  }
}

export const conversationRepository = new ConversationRepository();