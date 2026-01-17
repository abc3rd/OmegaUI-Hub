import { AiProviderConfig, AiMessage, AiResponse } from "../../domain/AiProviderConfig";

export class OpenAIClient {
  constructor(private config: AiProviderConfig) {}

  async sendMessage(messages: AiMessage[]): Promise<AiResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(error.error?.message || "Failed to get AI response");
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || "",
      tokens: data.usage?.total_tokens,
      model: data.model,
    };
  }

  async *streamMessage(messages: AiMessage[]): AsyncGenerator<string> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to stream AI response");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }
}