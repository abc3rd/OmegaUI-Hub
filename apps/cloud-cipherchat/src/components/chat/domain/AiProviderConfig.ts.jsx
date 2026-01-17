export interface AiProviderConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  useUcp: boolean;
}

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiResponse {
  content: string;
  tokens?: number;
  model?: string;
}