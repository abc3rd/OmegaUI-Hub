import { OpenAIClient } from "./OpenAIClient";

const UCP_SYSTEM_PROMPT = `You are a helpful AI assistant optimized for clear, concise responses. 
Focus on accuracy and relevance. Keep responses well-structured and easy to understand.`;

export class UCPClient {
  constructor(config) {
    this.openAIClient = new OpenAIClient(config);
  }

  wrapWithUCP(messages) {
    const hasSystemPrompt = messages.some(m => m.role === 'system');
    
    if (hasSystemPrompt) {
      return messages;
    }

    return [
      { role: 'system', content: UCP_SYSTEM_PROMPT },
      ...messages
    ];
  }

  async sendMessage(messages) {
    const wrappedMessages = this.wrapWithUCP(messages);
    return this.openAIClient.sendMessage(wrappedMessages);
  }

  async *streamMessage(messages) {
    const wrappedMessages = this.wrapWithUCP(messages);
    yield* this.openAIClient.streamMessage(wrappedMessages);
  }
}