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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Plus, Users, TrendingUp, Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROOM_CATEGORIES = [
  { value: 'general', label: 'General', icon: Hash },
  { value: 'support', label: 'Support', icon: Users },
  { value: 'development', label: 'Development', icon: TrendingUp },
  { value: 'marketing', label: 'Marketing', icon: Globe },
  { value: 'sales', label: 'Sales', icon: TrendingUp },
  { value: 'random', label: 'Random', icon: Hash }
];

export default function PublicRoomsDialog({ 
  open, 
  onClose, 
  publicRooms,
  onJoinRoom,
  onCreateRoom,
  currentUser 
}) {
  const [view, setView] = useState('browse'); // 'browse' or 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoom, setNewRoom] = useState({
    name: '',
    topic: '',
    category: 'general'
  });

  const filteredRooms = publicRooms.filter(room => 
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.room_topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) return;
    onCreateRoom(newRoom);
    setNewRoom({ name: '', topic: '', category: 'general' });
    setView('browse');
  };

  const getCategoryIcon = (category) => {
    const cat = ROOM_CATEGORIES.find(c => c.value === category);
    return cat?.icon || Hash;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Public Chat Rooms
          </DialogTitle>
        </DialogHeader>

        <Tabs value={view} onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Rooms</TabsTrigger>
            <TabsTrigger value="create">Create Room</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search public rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No public rooms found</p>
                    <p className="text-sm">Create one to get started!</p>
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const CategoryIcon = getCategoryIcon(room.room_category);
                    const isMember = room.participants.includes(currentUser.email);
                    
                    return (
                      <div
                        key={room.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon className="w-5 h-5 text-emerald-600" />
                              <h3 className="font-semibold text-lg">{room.name}</h3>
                              <Badge variant="secondary" className="ml-2">
                                {room.room_category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{room.room_topic}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {room.participants.length} members
                              </span>
                              {room.created_by_org && (
                                <span>by {room.created_by_org}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => onJoinRoom(room)}
                            disabled={isMember}
                            className={cn(
                              isMember 
                                ? "bg-gray-200 text-gray-600 cursor-default"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                          >
                            {isMember ? 'Joined' : 'Join'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="e.g. Cloud Connect Support"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="room-topic">Room Topic/Description</Label>
                <Textarea
                  id="room-topic"
                  placeholder="What's this room about?"
                  value={newRoom.topic}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, topic: e.target.value }))}
                  className="mt-2 h-24"
                />
              </div>

              <div>
                <Label htmlFor="room-category">Category</Label>
                <Select
                  value={newRoom.category}
                  onValueChange={(value) => setNewRoom(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-1">Public Room Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Public rooms are visible to all Cloud Connect users</li>
                  <li>• Anyone can join and participate</li>
                  <li>• Messages are encrypted but visible to all members</li>
                  <li>• Be respectful and professional</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={!newRoom.name.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Public Room
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}