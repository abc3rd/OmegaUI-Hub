import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation } from "./hooks/useConversations";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ConversationList({ onSelectConversation, selectedId }) {
  const { data: conversations = [], isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  const handleCreate = async () => {
    const title = `Chat ${format(new Date(), "MMM d, h:mm a")}`;
    const newConv = await createConversation.mutateAsync(title);
    onSelectConversation(newConv.id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this conversation? All messages will be permanently removed.")) {
      await deleteConversation.mutateAsync(id);
      if (selectedId === id) {
        onSelectConversation(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Secure Chats</h2>
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No conversations yet</p>
            <p className="text-slate-400 text-xs mt-1">Create your first encrypted chat</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === conv.id ? "ring-2 ring-slate-900 bg-white" : "bg-white hover:bg-slate-50"
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-slate-900 truncate">
                      {conv.title}
                    </CardTitle>
                    {conv.lastMessagePreview && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {conv.lastMessagePreview}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {format(new Date(conv.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                    onClick={(e) => handleDelete(e, conv.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}