import { useState } from "react";
import { useSendMessage, useAddAiResponse } from "./useMessages";
import { useAiProvider } from "./useAiProvider";
import { AiClientFactory } from "../infrastructure/ai/AiClientFactory";
import { AiMessage } from "../domain/AiProviderConfig";
import { DecryptedMessage } from "../domain/SecureMessage";

export const useAiChat = (conversationId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendMessage = useSendMessage();
  const addAiResponse = useAddAiResponse();
  const { config, isConfigured } = useAiProvider();

  const sendUserMessage = async (content: string, messageHistory: DecryptedMessage[]) => {
    if (!conversationId || !isConfigured) {
      setError("AI provider not configured");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      await sendMessage.mutateAsync({ conversationId, content });

      const aiMessages: AiMessage[] = [
        ...messageHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user' as const, content },
      ];

      const aiClient = AiClientFactory.create(config);
      const response = await aiClient.sendMessage(aiMessages);

      await addAiResponse.mutateAsync({
        conversationId,
        content: response.content,
        metadata: {
          tokens: response.tokens,
          model: response.model,
          provider: config.useUcp ? "ucp" : "openai",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendUserMessage,
    isProcessing,
    error,
    isConfigured,
  };
};