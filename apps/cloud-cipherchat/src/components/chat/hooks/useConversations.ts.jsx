import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationRepository } from "../infrastructure/repositories/ConversationRepository";
import { messageRepository } from "../infrastructure/repositories/MessageRepository";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationRepository.listAll(),
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => conversationRepository.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await messageRepository.deleteByConversation(id);
      await conversationRepository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => 
      conversationRepository.update(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};