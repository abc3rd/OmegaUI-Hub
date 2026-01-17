import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { BookOpen, CheckCircle } from 'lucide-react';
import CopyButton from '../components/shared/CopyButton';

const PLATFORM_GUIDES = {
  OBS: {
    steps: [
      'Open OBS Studio',
      'Go to Settings → Stream',
      'Select "Custom" as Service',
      'Paste your RTMP Server URL',
      'Paste your Stream Key',
      'Click "Apply" then "OK"',
      'Start Streaming!',
    ],
    rtmpExample: 'rtmp://live.platform.com/app',
  },
  Streamlabs: {
    steps: [
      'Open Streamlabs Desktop',
      'Click Settings (gear icon)',
      'Go to Stream tab',
      'Select "Custom RTMP"',
      'Enter your RTMP URL and Stream Key',
      'Save settings',
      'Click "Go Live"',
    ],
    rtmpExample: 'rtmp://live.platform.com/app',
  },
  'XSplit': {
    steps: [
      'Open XSplit Broadcaster',
      'Click Broadcast → Set up a new output → Custom RTMP',
      'Name your output',
      'Enter RTMP URL and Stream Key',
      'Click OK',
      'Select your output and click Broadcast',
    ],
    rtmpExample: 'rtmp://live.platform.com/app',
  },
};

export default function Guides() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Setup Guides</h1>
        <p className="text-slate-400">Step-by-step instructions for your streaming software</p>
      </div>

      <Alert className="bg-purple-950 border-purple-800">
        <BookOpen className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-purple-200">
          Get your stream keys from the Key Vault, then follow these guides to configure your streaming software.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Setup Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="OBS" className="w-full">
            <TabsList className="bg-slate-800 w-full justify-start">
              {Object.keys(PLATFORM_GUIDES).map(software => (
                <TabsTrigger key={software} value={software}>
                  {software}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(PLATFORM_GUIDES).map(([software, guide]) => (
              <TabsContent key={software} value={software} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Setting up {software} for Multi-Platform Streaming
                  </h3>
                  <div className="space-y-3">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-slate-300 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-slate-400">RTMP Server URL Example</Label>
                      <CopyButton text={guide.rtmpExample} label="RTMP URL" />
                    </div>
                    <code className="block bg-slate-900 text-purple-300 px-3 py-2 rounded font-mono text-sm">
                      {guide.rtmpExample}
                    </code>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-400 block mb-2">Stream Key</Label>
                    <code className="block bg-slate-900 text-slate-500 px-3 py-2 rounded font-mono text-sm">
                      Get from Key Vault →
                    </code>
                  </div>
                </div>

                <div className="bg-green-950 border border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-green-200 font-semibold mb-1">Troubleshooting Tips</h4>
                      <ul className="text-sm text-green-200 space-y-1 list-disc list-inside">
                        <li>Make sure your stream key is copied correctly (no extra spaces)</li>
                        <li>Check that your internet upload speed is sufficient (3-6 Mbps minimum)</li>
                        <li>Verify the platform is enabled in your Platforms settings</li>
                        <li>Try restarting {software} if connection fails</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Multi-Streaming Guide */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Multi-Platform Streaming (Simulcasting)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">
            To stream to multiple platforms simultaneously, you need a multi-RTMP solution:
          </p>
          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Option 1: OBS Multiple RTMP Plugin</h4>
              <p className="text-sm text-slate-300 mb-2">
                Install the "Multiple RTMP outputs" plugin for OBS Studio. This allows you to add multiple stream destinations directly in OBS.
              </p>
              <p className="text-xs text-slate-400">Download from obs-websocket GitHub or OBS forums</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Option 2: Restream Service</h4>
              <p className="text-sm text-slate-300 mb-2">
                Use a restreaming service like Restream.io or Castr. Stream once to their server, and they distribute to all your platforms.
              </p>
              <p className="text-xs text-slate-400">May require subscription for multiple destinations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}