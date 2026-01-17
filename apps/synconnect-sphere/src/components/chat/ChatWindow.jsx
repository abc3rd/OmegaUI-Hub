import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Users, 
  Phone, 
  Video,
  Info,
  Lock,
  Shield,
  Hash
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { cn } from '@/lib/utils';

export default function ChatWindow({ 
  conversation,
  messages = [],
  currentUser,
  onSendMessage,
  onSendFile,
  onSendVoice,
  onSendLocation,
  onReaction,
  onShowInfo
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center omega-gradient shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Omega UI Secure Chat
          </h3>
          <p className="text-gray-600 mb-1">
            End-to-end encrypted messaging
          </p>
          <p className="text-sm omega-text-primary flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your messages are private and secure
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Contact: syncloud@omegaui.com
          </p>
        </div>
      </div>
    );
  }

  const getConversationName = () => {
    if (conversation.type === 'group') return conversation.name || 'Group Chat';
    const otherParticipant = conversation.participants?.find(p => p !== currentUser?.email);
    return otherParticipant?.split('@')[0] || 'Unknown User';
  };

  const getConversationIcon = () => {
    if (conversation.type === 'group') return Users;
    return null;
  };

  const ConversationIcon = getConversationIcon();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback 
              className={cn(
                "text-white font-semibold",
                conversation.type === 'group' ? "omega-gradient" : ""
              )} 
              style={{ background: conversation.type !== 'group' ? '#ea00ea' : undefined }}
            >
              {ConversationIcon ? (
                <ConversationIcon className="w-5 h-5" />
              ) : (
                getConversationName()[0]?.toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              {getConversationName()}
              <Lock className="w-3 h-3 omega-text-primary" />
            </h2>
            <p className="text-sm omega-text-primary flex items-center gap-1">
              <Shield className="w-3 h-3" />
              End-to-end encrypted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onShowInfo}>
            <Info className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea 
        ref={scrollRef}
        className="flex-1 px-6 py-4"
      >
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUser={currentUser}
                onReaction={onReaction}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <MessageInput
        onSendMessage={onSendMessage}
        onSendFile={onSendFile}
        onSendVoice={onSendVoice}
        onSendLocation={onSendLocation}
      />
    </div>
  );
}