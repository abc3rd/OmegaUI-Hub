import { OpenAIClient } from "./OpenAIClient";
import { UCPClient } from "./UCPClient";

export class AiClientFactory {
  static create(config) {
    if (config.useUcp) {
      return new UCPClient(config);
    }
    return new OpenAIClient(config);
  }
}