import React, { useState, useEffect } from "react";
import { Conversation } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Pin, 
  Archive, 
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ChatSidebar({ 
  conversations, 
  currentConversation, 
  onConversationSelect, 
  onNewConversation,
  onConversationUpdate,
  onConversationDelete
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    const filtered = conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredConversations(filtered);
  }, [conversations, searchQuery]);

  const handleArchive = async (conversation) => {
    await Conversation.update(conversation.id, { is_archived: !conversation.is_archived });
    onConversationUpdate();
  };

  const handlePin = async (conversation) => {
    await Conversation.update(conversation.id, { is_pinned: !conversation.is_pinned });
    onConversationUpdate();
  };

  const pinnedConversations = filteredConversations.filter(c => c.is_pinned && !c.is_archived);
  const regularConversations = filteredConversations.filter(c => !c.is_pinned && !c.is_archived);
  const archivedConversations = filteredConversations.filter(c => c.is_archived);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={onNewConversation}
          className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Pinned Conversations */}
          {pinnedConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Pinned
              </h3>
              <div className="space-y-1">
                {pinnedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversation?.id === conversation.id}
                    onSelect={onConversationSelect}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    onDelete={onConversationDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Conversations */}
          {regularConversations.length > 0 && (
            <div>
              {pinnedConversations.length > 0 && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Recent
                </h3>
              )}
              <div className="space-y-1">
                {regularConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversation?.id === conversation.id}
                    onSelect={onConversationSelect}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    onDelete={onConversationDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived Conversations */}
          {archivedConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Archived
              </h3>
              <div className="space-y-1">
                {archivedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversation?.id === conversation.id}
                    onSelect={onConversationSelect}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    onDelete={onConversationDelete}
                    isArchived
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect, 
  onPin, 
  onArchive, 
  onDelete, 
  isArchived = false 
}) {
  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-blue-50 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {conversation.title}
          </h4>
          {conversation.is_pinned && (
            <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500">
          {format(new Date(conversation.updated_date), "MMM d, h:mm a")}
        </p>
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {conversation.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onPin(conversation)}>
            <Pin className="w-4 h-4 mr-2" />
            {conversation.is_pinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive(conversation)}>
            <Archive className="w-4 h-4 mr-2" />
            {conversation.is_archived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(conversation)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}