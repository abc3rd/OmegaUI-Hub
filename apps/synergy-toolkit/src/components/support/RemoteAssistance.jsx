import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Share, 
  Phone, 
  Video, 
  Users, 
  Clock,
  ExternalLink
} from "lucide-react";

export default function RemoteAssistance() {
  const [sessionCode, setSessionCode] = useState('');
  const [activeSessions] = useState([
    {
      id: 1,
      client: "John Smith - TechCorp",
      duration: "00:15:32",
      type: "Screen Share",
      status: "active"
    },
    {
      id: 2,
      client: "Sarah Wilson - RetailCo",
      duration: "00:08:45",
      type: "Voice Call",
      status: "active"
    }
  ]);

  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(code);
  };

  return (
    <div className="space-y-6">
      {/* Quick Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share className="w-5 h-5 text-blue-400" />
              Start Remote Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Session Code</Label>
              <div className="flex gap-2">
                <Input
                  value={sessionCode}
                  readOnly
                  placeholder="Click generate to create code"
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Button onClick={generateSessionCode} variant="outline" className="border-gray-600">
                  Generate
                </Button>
              </div>
              {sessionCode && (
                <p className="text-sm text-gray-400 mt-1">
                  Share this code with the client to start remote assistance
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Monitor className="w-4 h-4 mr-2" />
                Screen Share
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" />
              Join Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Enter Session Code</Label>
              <Input
                placeholder="Enter 6-digit code"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-white">{session.client}</p>
                    <p className="text-sm text-gray-400">{session.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{session.duration}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {session.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Join
                  </Button>
                </div>
              </div>
            ))}
            {activeSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No active remote assistance sessions</p>
                <p className="text-sm text-gray-600 mt-1">Start a session to provide remote support</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}