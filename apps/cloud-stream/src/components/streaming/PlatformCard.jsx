import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Trash2, Eye, EyeOff, Edit, Youtube, Twitch as TwitchIcon, Facebook, Radio } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_ICONS = {
  youtube: Youtube,
  twitch: TwitchIcon,
  facebook: Facebook,
  custom: Radio,
  other: Radio
};

const PLATFORM_COLORS = {
  youtube: "bg-red-500",
  twitch: "bg-purple-500",
  facebook: "bg-blue-500",
  custom: "bg-slate-500",
  other: "bg-slate-500"
};

export default function PlatformCard({ destination, onToggle, onDelete, onEdit }) {
  const [showKey, setShowKey] = useState(false);
  const Icon = PLATFORM_ICONS[destination.platform_type] || Radio;
  const colorClass = PLATFORM_COLORS[destination.platform_type] || "bg-slate-500";

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`${colorClass} p-2 rounded-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{destination.platform_name}</CardTitle>
              <Badge variant={destination.is_active ? "default" : "secondary"} className="mt-1">
                {destination.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <Switch
            checked={destination.is_active}
            onCheckedChange={() => onToggle(destination)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stream URL */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wide">Server URL</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-slate-900 text-slate-300 px-3 py-2 rounded text-sm overflow-x-auto">
              {destination.stream_url}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copyToClipboard(destination.stream_url, "Server URL")}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stream Key */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wide">Stream Key</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-slate-900 text-slate-300 px-3 py-2 rounded text-sm overflow-x-auto">
              {showKey ? destination.stream_key : "•".repeat(20)}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowKey(!showKey)}
              className="text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copyToClipboard(destination.stream_key, "Stream key")}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {destination.notes && (
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wide">Notes</label>
            <p className="text-sm text-slate-300 mt-1">{destination.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(destination)}
            className="flex-1 text-slate-400 hover:text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(destination)}
            className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}