import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings, Trash2, Camera, Mic,
  Eye, Activity, Save
} from "lucide-react";

export default function CameraControls({ camera, onUpdate }) {
  const [settings, setSettings] = useState(camera.settings || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Camera.update(camera.id, { settings });
      onUpdate();
    } catch (error) {
      console.error("Error updating camera:", error);
      alert("Failed to update camera settings");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete camera "${camera.camera_name}"?`)) {
      try {
        await base44.entities.Camera.delete(camera.id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting camera:", error);
        alert("Failed to delete camera");
      }
    }
  };

  return (
    <Card className="bg-slate-900/70 border-cyan-500/20">
      <CardHeader className="border-b border-cyan-500/10">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-cyan-400" />
            Camera Settings: {camera.camera_name}
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Camera Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white mb-3">Camera Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-medium">{camera.camera_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">IP Address:</span>
                <span className="text-white font-mono">{camera.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MAC Address:</span>
                <span className="text-white font-mono">{camera.mac_address || "N/A"}</span>
              </div>
              {camera.make && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Make/Model:</span>
                  <span className="text-white">{camera.make} {camera.model}</span>
                </div>
              )}
              {camera.firmware_version && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Firmware:</span>
                  <span className="text-white">{camera.firmware_version}</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-3">Stream Settings</h3>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-cyan-400" />
                <Label htmlFor="recording" className="text-white font-medium cursor-pointer">
                  Enable Recording
                </Label>
              </div>
              <Switch
                id="recording"
                checked={settings.recording_enabled || false}
                onCheckedChange={(checked) => setSettings({...settings, recording_enabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <Label htmlFor="motion" className="text-white font-medium cursor-pointer">
                  Motion Detection
                </Label>
              </div>
              <Switch
                id="motion"
                checked={settings.motion_detection || false}
                onCheckedChange={(checked) => setSettings({...settings, motion_detection: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-400" />
                <Label htmlFor="facial" className="text-white font-medium cursor-pointer">
                  Facial Recognition
                </Label>
              </div>
              <Switch
                id="facial"
                checked={settings.facial_recognition || false}
                onCheckedChange={(checked) => setSettings({...settings, facial_recognition: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-cyan-400" />
                <Label htmlFor="audio" className="text-white font-medium cursor-pointer">
                  Audio Enabled
                </Label>
              </div>
              <Switch
                id="audio"
                checked={settings.audio_enabled || false}
                onCheckedChange={(checked) => setSettings({...settings, audio_enabled: checked})}
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-cyan-500 hover:bg-cyan-600 gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}