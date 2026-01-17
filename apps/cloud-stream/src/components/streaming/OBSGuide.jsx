import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Settings, Radio } from "lucide-react";

export default function OBSGuide() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          OBS Multi-Streaming Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-slate-300">
        <Alert className="bg-slate-900 border-slate-700">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            To stream to multiple platforms simultaneously, you'll need a plugin for OBS Studio.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Method 1: Using RTMP Output Plugin
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download and install the "Multiple RTMP Output" plugin for OBS</li>
            <li>In OBS, go to <code className="bg-slate-900 px-2 py-1 rounded">Tools → Multiple RTMP Output</code></li>
            <li>For each destination above, click "Add" and paste the Server URL and Stream Key</li>
            <li>Enable the outputs you want to stream to</li>
            <li>Start streaming in OBS as normal - it will stream to all enabled destinations</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Method 2: Using Restream Service
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Sign up for a multi-streaming service like Restream.io</li>
            <li>Connect your platforms through their dashboard</li>
            <li>Use Restream's RTMP server in OBS Settings → Stream</li>
            <li>Single stream goes to Restream, which distributes to all platforms</li>
          </ol>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Quick Reference: OBS Settings</h4>
          <ul className="space-y-2 text-sm">
            <li><strong>Encoder:</strong> x264 or NVENC (if available)</li>
            <li><strong>Bitrate:</strong> 4500-6000 kbps for 1080p</li>
            <li><strong>Keyframe Interval:</strong> 2 seconds</li>
            <li><strong>Preset:</strong> veryfast or faster</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}