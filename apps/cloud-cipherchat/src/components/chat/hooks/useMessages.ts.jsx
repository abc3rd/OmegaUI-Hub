import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageRepository } from "../infrastructure/repositories/MessageRepository";
import { conversationRepository } from "../infrastructure/repositories/ConversationRepository";
import { DecryptedMessage } from "../domain/SecureMessage";

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const encrypted = await messageRepository.listByConversation(conversationId);
      return messageRepository.decryptMessages(encrypted);
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content 
    }: { 
      conversationId: string; 
      content: string;
    }) => {
      await messageRepository.create(conversationId, "user", content);
      await conversationRepository.update(conversationId, {
        lastMessagePreview: content.slice(0, 50),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useAddAiResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content,
      metadata 
    }: { 
      conversationId: string; 
      content: string;
      metadata?: { tokens?: number; provider?: string; model?: string };
    }) => {
      await messageRepository.create(conversationId, "assistant", content, metadata);
      await conversationRepository.update(conversationId, {
        lastMessagePreview: content.slice(0, 50),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};