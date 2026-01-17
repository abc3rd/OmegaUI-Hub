import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Eye, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import PrivacyToggle from '../components/shared/PrivacyToggle';
import CopyButton from '../components/shared/CopyButton';

export default function Viewers() {
  const [visibility, setVisibility] = useState('PRIVATE');
  const [publicSlug, setPublicSlug] = useState('my-stream-viewers');

  const platforms = [
    { name: 'Twitch', viewers: 0, color: 'text-purple-500' },
    { name: 'YouTube', viewers: 0, color: 'text-red-500' },
    { name: 'Kick', viewers: 0, color: 'text-green-500' },
    { name: 'Facebook', viewers: 0, color: 'text-blue-500' },
  ];

  const totalViewers = platforms.reduce((sum, p) => sum + p.viewers, 0);
  const publicUrl = `${window.location.origin}/widget/viewers/${publicSlug}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Viewer Analytics</h1>
        <p className="text-slate-400">Monitor your audience across all platforms</p>
      </div>

      <Alert className="bg-blue-950 border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>TODO:</strong> Viewer count integration requires API access to each platform. Connect your accounts to enable live viewer tracking.
        </AlertDescription>
      </Alert>

      {/* Privacy Control */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            visibility={visibility}
            onToggle={setVisibility}
            itemName="viewer counter"
          />

          {visibility === 'PUBLIC' && (
            <div className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Public Widget URL</label>
                <div className="flex gap-2">
                  <Input
                    value={publicUrl}
                    readOnly
                    className="bg-slate-900 border-slate-700 font-mono text-sm"
                  />
                  <CopyButton text={publicUrl} label="Widget URL" />
                  <Button size="icon" variant="outline" className="border-slate-700">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Embed this URL in OBS as a browser source to display viewer count publicly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Viewers */}
      <Card className="bg-gradient-to-br from-purple-900 to-slate-900 border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-200">Total Viewers</p>
                <p className="text-4xl font-bold text-white">{totalViewers}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-semibold">+0%</span>
              </div>
              <p className="text-xs text-purple-200 mt-1">vs last stream</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Platform Breakdown */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map(platform => (
              <div key={platform.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{platform.name}</h3>
                  <Eye className={`w-5 h-5 ${platform.color}`} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{platform.viewers}</p>
                <p className="text-xs text-slate-400">viewers</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Placeholder */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Viewer History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">Historical viewer data will appear here</p>
            <p className="text-xs text-slate-500 mt-2">Start streaming to begin tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}