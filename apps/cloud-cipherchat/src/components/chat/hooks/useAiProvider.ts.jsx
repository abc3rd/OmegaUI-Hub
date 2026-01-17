import { useState, useEffect } from "react";
import { AiProviderConfig } from "../domain/AiProviderConfig";

const STORAGE_KEY = "ai_provider_config";

const DEFAULT_CONFIG: AiProviderConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  modelName: "gpt-4o-mini",
  useUcp: false,
};

export const useAiProvider = () => {
  const [config, setConfigState] = useState<AiProviderConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const setConfig = (newConfig: Partial<AiProviderConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfigState(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isConfigured = config.apiKey.length > 0;

  return { config, setConfig, isConfigured };
};