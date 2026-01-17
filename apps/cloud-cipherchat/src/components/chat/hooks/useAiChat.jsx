import { useState } from "react";
import { useSendMessage, useAddAiResponse } from "./useMessages";
import { useAiProvider } from "./useAiProvider";
import { AiClientFactory } from "../infrastructure/ai/AiClientFactory";

export const useAiChat = (conversationId) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [error, setError] = useState(null);
  const sendMessage = useSendMessage();
  const addAiResponse = useAddAiResponse();
  const { config, isConfigured } = useAiProvider();

  const sendUserMessage = async (content, messageHistory = []) => {
    if (!conversationId) {
      setError("No conversation selected");
      return;
    }

    if (!isConfigured) {
      setError("AI provider not configured. Please set up your API key in Settings.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessingStatus("Encrypting message...");

    try {
      await sendMessage.mutateAsync({ conversationId, content });

      setProcessingStatus("Sending encrypted request...");

      const aiMessages = [
        ...messageHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content },
      ];

      const aiClient = AiClientFactory.create(config);
      
      setProcessingStatus("Waiting for AI response...");
      const response = await aiClient.sendMessage(aiMessages);

      setProcessingStatus("Encrypting response...");
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
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  return {
    sendUserMessage,
    isProcessing,
    processingStatus,
    error,
    isConfigured,
  };
};