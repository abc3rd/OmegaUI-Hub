import React, { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Users, MessageCircle, Lock, Hash, Globe, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
  do_not_disturb: 'bg-gray-500'
};

export default function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onNewChat,
  onPublicRooms,
  onEditProfile,
  currentUser,
  allUsers = []
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const getConversationName = (conv) => {
    if (conv.type === 'group') return conv.name || 'Group Chat';
    const otherParticipant = conv.participants.find(p => p !== currentUser.email);
    const user = allUsers.find(u => u.email === otherParticipant);
    return user?.full_name || otherParticipant || 'Unknown User';
  };

  const getConversationAvatar = (conv) => {
    if (conv.type === 'group') {
      return conv.avatar_url || null;
    }
    const otherParticipant = conv.participants.find(p => p !== currentUser.email);
    const user = allUsers.find(u => u.email === otherParticipant);
    return user?.avatar_url || null;
  };

  const getUserStatus = (conv) => {
    if (conv.type !== 'direct') return null;
    const otherParticipant = conv.participants.find(p => p !== currentUser.email);
    const user = allUsers.find(u => u.email === otherParticipant);
    return user?.availability || 'available';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd/MM/yy');
  };

  const filteredConversations = conversations.filter(conv => 
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const privateChats = filteredConversations.filter(c => c.type === 'direct');
  const groupChats = filteredConversations.filter(c => c.type === 'group');

  const renderConversation = (conv) => {
    const status = getUserStatus(conv);
    
    return (
      <div
        key={conv.id}
        onClick={() => onSelectConversation(conv)}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
          selectedConversation?.id === conv.id && "bg-purple-50 hover:bg-purple-50 border-l-4"
        )}
        style={{ borderColor: selectedConversation?.id === conv.id ? '#ea00ea' : 'transparent' }}
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={getConversationAvatar(conv)} />
            <AvatarFallback 
              className={cn(
                "text-white font-semibold",
                conv.type === 'group' ? "omega-gradient" : ""
              )} 
              style={{ background: conv.type !== 'group' ? '#ea00ea' : undefined }}
            >
              {conv.type === 'public_room' ? (
                <Hash className="w-5 h-5" />
              ) : conv.type === 'group' ? (
                <Users className="w-5 h-5" />
              ) : (
                getConversationName(conv)[0]?.toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          {conv.type === 'direct' && status && (
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
              STATUS_COLORS[status]
            )} />
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center" style={{ background: '#ea00ea' }}>
            <Lock className="w-2 h-2 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {getConversationName(conv)}
            </h3>
            <span className="text-xs text-gray-500 ml-2">
              {formatTime(conv.last_message_time)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate flex items-center gap-1">
            <Lock className="w-3 h-3 omega-text-primary" />
            {conv.last_message_cipher_preview ? 'Encrypted message' : 'No messages yet'}
          </p>
        </div>

        {(conv.type === 'group' || conv.type === 'public_room') && (
          <Badge variant="secondary" className="ml-2">
            {conv.participants.length}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b omega-gradient">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-white" />
              <Lock className="w-3 h-3 text-white absolute -bottom-0.5 -right-0.5 rounded-full p-0.5" style={{ background: '#ea00ea' }} />
            </div>
            Omega UI Connect
          </h2>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                  <Plus className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onNewChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditProfile}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-semibold">No conversations yet</p>
              <p className="text-sm">Start chatting!</p>
            </div>
          ) : (
            <>
              {privateChats.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                    Direct Messages
                  </h3>
                  {privateChats.map(renderConversation)}
                </div>
              )}

              {groupChats.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                    Group Chats
                  </h3>
                  {groupChats.map(renderConversation)}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t" style={{ background: '#f3e8f3' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser?.avatar_url} />
              <AvatarFallback className="text-white text-sm" style={{ background: '#ea00ea' }}>
                {currentUser?.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.full_name}</p>
              <div className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[currentUser?.availability || 'available'])} />
                <span className="text-xs text-gray-600">{currentUser?.availability || 'available'}</span>
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onEditProfile}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}