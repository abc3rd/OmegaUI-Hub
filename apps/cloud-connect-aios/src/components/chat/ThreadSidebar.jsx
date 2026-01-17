import React, { useState, useEffect } from "react";
import { Thread } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Archive, 
  Trash2,
  Hash,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ThreadSidebar({ 
  threads, 
  currentThread, 
  onThreadSelect, 
  onNewThread,
  onThreadUpdate,
  onThreadDelete
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredThreads, setFilteredThreads] = useState([]);

  useEffect(() => {
    const filtered = threads.filter(thread => 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredThreads(filtered);
  }, [threads, searchQuery]);

  const handleArchive = async (thread) => {
    await Thread.update(thread.id, { archived: !thread.archived });
    onThreadUpdate();
  };

  const pinnedThreads = filteredThreads.filter(t => !t.archived);
  const archivedThreads = filteredThreads.filter(t => t.archived);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={onNewThread}
          className="w-full mb-4 bg-gradient-to-r from-[#B4009E] to-[#02B6CE] hover:from-[#B4009E]/90 hover:to-[#02B6CE]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Active Threads */}
          {pinnedThreads.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Active Threads
              </h3>
              <div className="space-y-1">
                {pinnedThreads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={currentThread?.id === thread.id}
                    onSelect={onThreadSelect}
                    onArchive={handleArchive}
                    onDelete={onThreadDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived Threads */}
          {archivedThreads.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Archived
              </h3>
              <div className="space-y-1">
                {archivedThreads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={currentThread?.id === thread.id}
                    onSelect={onThreadSelect}
                    onArchive={handleArchive}
                    onDelete={onThreadDelete}
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

function ThreadItem({ 
  thread, 
  isActive, 
  onSelect, 
  onArchive, 
  onDelete, 
  isArchived = false 
}) {
  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-[#B4009E]/10 to-[#02B6CE]/10 border-l-4 border-[#B4009E]' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(thread)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-[#02B6CE] flex-shrink-0" />
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {thread.title}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Clock className="w-3 h-3" />
          {format(new Date(thread.updated_date), "MMM d, h:mm a")}
        </div>
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {thread.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0 bg-[#FFB902]/20 text-[#FFB902]">
                <Hash className="w-2 h-2 mr-1" />
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
          <DropdownMenuItem onClick={() => onArchive(thread)}>
            <Archive className="w-4 h-4 mr-2" />
            {thread.archived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(thread)}
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