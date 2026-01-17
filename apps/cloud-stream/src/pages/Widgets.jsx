import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gauge, Plus, ExternalLink, Shield, Info } from 'lucide-react';
import { toast } from 'sonner';
import PrivacyToggle from '../components/shared/PrivacyToggle';
import CopyButton from '../components/shared/CopyButton';

const WIDGET_TYPES = [
  { name: 'ViewersIndicator', label: 'Viewer Counter', description: 'Display total viewer count' },
  { name: 'Chat', label: 'Chat Overlay', description: 'Show aggregated chat messages' },
  { name: 'EmojiReactions', label: 'Emoji Reactions', description: 'Interactive emoji reactions' },
  { name: 'StatusBar', label: 'Status Bar', description: 'Show platform connection status' },
];

export default function Widgets() {
  const [selectedWidget, setSelectedWidget] = useState(null);
  const queryClient = useQueryClient();

  const { data: widgets = [] } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => base44.entities.WidgetSettings.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WidgetSettings.create({
      ...data,
      public_slug: data.visibility === 'PUBLIC' ? `${data.widget_name.toLowerCase()}-${Date.now()}` : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['widgets']);
      toast.success('Widget created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WidgetSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['widgets']);
      toast.success('Widget updated');
    },
  });

  const handleCreateWidget = (widgetType) => {
    createMutation.mutate({
      widget_name: widgetType,
      visibility: 'PRIVATE',
      theme: 'dark',
      position: 'overlay',
    });
  };

  const handleToggleVisibility = (widget, newVisibility) => {
    const publicSlug = newVisibility === 'PUBLIC' && !widget.public_slug
      ? `${widget.widget_name.toLowerCase()}-${Date.now()}`
      : widget.public_slug;

    updateMutation.mutate({
      id: widget.id,
      data: { ...widget, visibility: newVisibility, public_slug: publicSlug }
    });
  };

  const getWidgetUrl = (widget) => {
    if (widget.visibility === 'PRIVATE') return null;
    return `${window.location.origin}/widget/${widget.widget_name.toLowerCase()}/${widget.public_slug}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Stream Widgets</h1>
        <p className="text-slate-400">Manage OBS-ready overlay widgets</p>
      </div>

      <Alert className="bg-blue-950 border-blue-800">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>Privacy First:</strong> All widgets default to PRIVATE (streamer-only). Enable PUBLIC mode to generate shareable overlay URLs for OBS.
        </AlertDescription>
      </Alert>

      {/* Available Widgets */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Available Widget Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WIDGET_TYPES.map(widgetType => {
              const existingWidget = widgets.find(w => w.widget_name === widgetType.name);
              return (
                <div key={widgetType.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{widgetType.label}</h3>
                      <p className="text-sm text-slate-400 mt-1">{widgetType.description}</p>
                    </div>
                    <Gauge className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  </div>
                  {existingWidget ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedWidget(existingWidget)}
                      className="w-full border-slate-700"
                    >
                      Configure
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleCreateWidget(widgetType.name)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Widget
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Widgets */}
      {widgets.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Your Widgets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {widgets.map(widget => {
              const widgetType = WIDGET_TYPES.find(t => t.name === widget.widget_name);
              const widgetUrl = getWidgetUrl(widget);

              return (
                <div key={widget.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{widgetType?.label || widget.widget_name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{widgetType?.description}</p>
                    </div>
                    {widget.visibility === 'PRIVATE' ? (
                      <Shield className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-xs font-medium">PUBLIC</span>
                      </div>
                    )}
                  </div>

                  <PrivacyToggle
                    visibility={widget.visibility}
                    onToggle={(newVisibility) => handleToggleVisibility(widget, newVisibility)}
                    itemName={widgetType?.label.toLowerCase() || 'widget'}
                  />

                  {widgetUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-400">OBS Browser Source URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={widgetUrl}
                          readOnly
                          className="bg-slate-900 border-slate-700 font-mono text-sm"
                        />
                        <CopyButton text={widgetUrl} label="Widget URL" />
                        <Button size="icon" variant="outline" className="border-slate-700">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Add this URL as a Browser Source in OBS to display the widget on your stream
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-400">Theme</Label>
                      <Select
                        value={widget.theme}
                        onValueChange={(theme) => updateMutation.mutate({
                          id: widget.id,
                          data: { ...widget, theme }
                        })}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="transparent">Transparent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400">Position</Label>
                      <Select
                        value={widget.position}
                        onValueChange={(position) => updateMutation.mutate({
                          id: widget.id,
                          data: { ...widget, position }
                        })}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="overlay">Overlay</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}