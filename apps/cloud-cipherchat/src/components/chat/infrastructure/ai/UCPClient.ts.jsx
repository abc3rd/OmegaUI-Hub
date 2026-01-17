import { AiProviderConfig, AiMessage, AiResponse } from "../../domain/AiProviderConfig";
import { OpenAIClient } from "./OpenAIClient";

const UCP_SYSTEM_PROMPT = `You are a helpful AI assistant optimized for clear, concise responses. 
Focus on accuracy and relevance. Keep responses well-structured and easy to understand.`;

export class UCPClient {
  private openAIClient: OpenAIClient;

  constructor(config: AiProviderConfig) {
    this.openAIClient = new OpenAIClient(config);
  }

  private wrapWithUCP(messages: AiMessage[]): AiMessage[] {
    const hasSystemPrompt = messages.some(m => m.role === 'system');
    
    if (hasSystemPrompt) {
      return messages;
    }

    return [
      { role: 'system', content: UCP_SYSTEM_PROMPT },
      ...messages
    ];
  }

  async sendMessage(messages: AiMessage[]): Promise<AiResponse> {
    const wrappedMessages = this.wrapWithUCP(messages);
    return this.openAIClient.sendMessage(wrappedMessages);
  }

  async *streamMessage(messages: AiMessage[]): AsyncGenerator<string> {
    const wrappedMessages = this.wrapWithUCP(messages);
    yield* this.openAIClient.streamMessage(wrappedMessages);
  }
}