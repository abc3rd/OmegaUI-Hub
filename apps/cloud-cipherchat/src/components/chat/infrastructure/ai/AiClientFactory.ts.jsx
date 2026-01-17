import { AiProviderConfig } from "../../domain/AiProviderConfig";
import { OpenAIClient } from "./OpenAIClient";
import { UCPClient } from "./UCPClient";

export type AiClient = OpenAIClient | UCPClient;

export class AiClientFactory {
  static create(config: AiProviderConfig): AiClient {
    if (config.useUcp) {
      return new UCPClient(config);
    }
    return new OpenAIClient(config);
  }
}