import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CameraManager() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    camera_name: "",
    camera_type: "security_cam",
    ip_address: "",
    mac_address: "",
    make: "",
    model: "",
    firmware_version: "",
    stream_url: "",
    resolution: "1920x1080",
    fps: 30
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await base44.entities.Camera.create({
        ...formData,
        user_email: user.email,
        status: "offline",
        settings: {
          recording_enabled: false,
          motion_detection: false,
          facial_recognition: false,
          audio_enabled: false
        }
      });
      
      navigate(createPageUrl("LiveStream"));
    } catch (error) {
      console.error("Error adding camera:", error);
      alert("Failed to add camera");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("LiveStream"))}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Live Stream
        </Button>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Camera className="w-6 h-6 text-cyan-400" />
              Add New Camera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="camera_name" className="text-gray-300">Camera Name *</Label>
                  <Input
                    id="camera_name"
                    value={formData.camera_name}
                    onChange={(e) => setFormData({...formData, camera_name: e.target.value})}
                    placeholder="Front Door Camera"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="camera_type" className="text-gray-300">Camera Type *</Label>
                  <Select
                    value={formData.camera_type}
                    onValueChange={(value) => setFormData({...formData, camera_type: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Camera</SelectItem>
                      <SelectItem value="pc_webcam">PC Webcam</SelectItem>
                      <SelectItem value="body_cam">Body Camera</SelectItem>
                      <SelectItem value="dash_cam">Dash Camera</SelectItem>
                      <SelectItem value="spy_cam">Spy Camera</SelectItem>
                      <SelectItem value="security_cam">Security Camera</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ip_address" className="text-gray-300">IP Address *</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    placeholder="192.168.1.100"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mac_address" className="text-gray-300">MAC Address</Label>
                  <Input
                    id="mac_address"
                    value={formData.mac_address}
                    onChange={(e) => setFormData({...formData, mac_address: e.target.value})}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make" className="text-gray-300">Manufacturer</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    placeholder="Hikvision, Dahua, etc."
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="model" className="text-gray-300">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Model number"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stream_url" className="text-gray-300">Stream URL</Label>
                <Input
                  id="stream_url"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
                  placeholder="rtsp://192.168.1.100:554/stream"
                  className="bg-slate-800 border-slate-700 text-white mt-2"
                />
                <p className="text-gray-500 text-xs mt-1">RTSP, WebRTC, or HTTP stream URL</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="resolution" className="text-gray-300">Resolution</Label>
                  <Input
                    id="resolution"
                    value={formData.resolution}
                    onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                    placeholder="1920x1080"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="fps" className="text-gray-300">FPS</Label>
                  <Input
                    id="fps"
                    type="number"
                    value={formData.fps}
                    onChange={(e) => setFormData({...formData, fps: parseInt(e.target.value)})}
                    placeholder="30"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="firmware_version" className="text-gray-300">Firmware</Label>
                  <Input
                    id="firmware_version"
                    value={formData.firmware_version}
                    onChange={(e) => setFormData({...formData, firmware_version: e.target.value})}
                    placeholder="v2.0.1"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-cyan-500 hover:bg-cyan-600 gap-2 h-12 text-lg"
              >
                <Save className="w-5 h-5" />
                {saving ? "Adding Camera..." : "Add Camera"}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}