import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send, Smile, AlertCircle } from 'lucide-react';

export default function Chat() {
  const [message, setMessage] = useState('');

  const platforms = ['Twitch', 'YouTube', 'Kick', 'Facebook', 'TikTok'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Chat Manager</h1>
        <p className="text-slate-400">Aggregate and manage chat from all platforms</p>
      </div>

      <Alert className="bg-blue-950 border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>TODO:</strong> Chat integration requires OAuth authentication for each platform. Connect your accounts in Settings to enable live chat.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Multi-Platform Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Twitch" className="w-full">
            <TabsList className="bg-slate-800 w-full justify-start overflow-x-auto flex-nowrap">
              {platforms.map(platform => (
                <TabsTrigger key={platform} value={platform} className="min-w-fit">
                  {platform}
                </TabsTrigger>
              ))}
            </TabsList>

            {platforms.map(platform => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                  <div className="text-center text-slate-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Connect {platform} to see live chat messages</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Send message to ${platform} chat...`}
                    className="bg-slate-800 border-slate-700"
                    disabled
                  />
                  <Button size="icon" className="bg-purple-600 hover:bg-purple-700" disabled>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-slate-700" disabled>
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Chat Overlay Widget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-slate-800 border-slate-700">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-slate-300">
              Generate a chat overlay URL to add to OBS. Configure visibility in Widgets settings.
            </AlertDescription>
          </Alert>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Generate Chat Overlay URL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}