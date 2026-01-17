import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Users, Search, Building2, Briefcase, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
  do_not_disturb: 'bg-gray-500'
};

export default function NewChatDialog({ 
  open, 
  onClose, 
  onCreateChat,
  allUsers,
  currentUser 
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatType, setChatType] = useState('private');
  const [searchScope, setSearchScope] = useState('app'); // 'app' or 'network'

  const availableUsers = allUsers.filter(u => 
    u.email !== currentUser.email &&
    (searchScope === 'network' ? u.visible_to_network !== false : true)
  );

  const filteredUsers = availableUsers.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = () => {
    if (chatType === 'private' && selectedUsers.length === 1) {
      onCreateChat('private', [currentUser.email, selectedUsers[0]], null);
    } else if (chatType === 'group' && selectedUsers.length >= 2 && groupName.trim()) {
      onCreateChat('group', [currentUser.email, ...selectedUsers], groupName.trim());
    }
    
    setSelectedUsers([]);
    setGroupName('');
    setSearchQuery('');
    onClose();
  };

  const toggleUser = (userEmail) => {
    setSelectedUsers(prev => 
      prev.includes(userEmail)
        ? prev.filter(e => e !== userEmail)
        : [...prev, userEmail]
    );
  };

  const renderUser = (user, selectable = true) => {
    const isSelected = selectedUsers.includes(user.email);
    
    return (
      <div
        key={user.email}
        onClick={() => selectable && (chatType === 'private' ? setSelectedUsers([user.email]) : toggleUser(user.email))}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors border-2",
          selectable && "cursor-pointer hover:bg-gray-50"
        )}
        style={{ 
          background: isSelected && selectable ? '#f3e8f3' : undefined,
          borderColor: isSelected && selectable ? '#ea00ea' : 'transparent'
        }}
      >
        {chatType === 'group' && selectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleUser(user.email)}
          />
        )}
        
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-white" style={{ background: '#ea00ea' }}>
              {user.email[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
            STATUS_COLORS[user.availability || 'available']
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{user.full_name || user.email.split('@')[0]}</p>
            {user.organization && searchScope === 'network' && (
              <Badge variant="secondary" className="text-xs">
                <Building2 className="w-3 h-3 mr-1" />
                {user.organization}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="truncate">{user.email}</span>
            {user.job_title && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <Briefcase className="w-3 h-3" />
                  {user.job_title}
                </span>
              </>
            )}
          </div>
          {user.status_message && (
            <p className="text-xs text-gray-600 italic mt-1 truncate">"{user.status_message}"</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs value={chatType} onValueChange={setChatType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Private Chat
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={searchScope === 'app' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchScope('app')}
                className="flex-1"
              >
                This App
              </Button>
              <Button
                variant={searchScope === 'network' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchScope('network')}
                className="flex-1 gap-2"
              >
                <Globe className="w-4 h-4" />
                Cloud Connect Network
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={searchScope === 'network' ? "Search across all Cloud Connect users..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map(user => renderUser(user))
                )}
              </div>
            </ScrollArea>

            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length !== 1}
              className="w-full text-white omega-primary hover:opacity-90"
            >
              Start Chat
            </Button>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={searchScope === 'app' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchScope('app')}
                className="flex-1"
              >
                This App
              </Button>
              <Button
                variant={searchScope === 'network' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchScope('network')}
                className="flex-1 gap-2"
              >
                <Globe className="w-4 h-4" />
                Cloud Connect Network
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredUsers.map(user => renderUser(user, true))}
              </div>
            </ScrollArea>

            <div className="text-sm text-gray-600">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'participant' : 'participants'} selected
            </div>

            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length < 2 || !groupName.trim()}
              className="w-full text-white omega-primary hover:opacity-90"
            >
              Create Group
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}