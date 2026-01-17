import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Phone } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-gray-800 rounded-lg flex justify-between items-center border-b border-gray-700">
          <div>
            <h3 className="font-bold text-lg">John Doe</h3>
            <p className="text-sm text-green-400">Online</p>
          </div>
          <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
              <Phone className="h-6 w-6"/>
          </Button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-end">
          <Card className="bg-cyan-600 text-white max-w-xs rounded-2xl rounded-br-none">
            <CardContent className="p-3">
              <p>Hey John, just following up on our meeting last week. Any updates on the proposal?</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-start">
          <Card className="bg-gray-700 text-white max-w-xs rounded-2xl rounded-bl-none">
            <CardContent className="p-3">
              <p>Hi! Yes, we've reviewed it and it looks great. We should be able to sign off by end of day tomorrow.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="p-4 bg-gray-800 flex gap-2 border-t border-gray-700">
        <Input placeholder="Type a message..." className="bg-gray-700 border-gray-600 text-white" />
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}