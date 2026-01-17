import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video, Plus, Camera, Scan, AlertTriangle, Shield, Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CameraGrid from "../components/livestream/CameraGrid";
import CameraControls from "../components/livestream/CameraControls";

export default function LiveStream() {
  const [user, setUser] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [gridLayout, setGridLayout] = useState(1);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityEnabled, setSecurityEnabled] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const verifications = await base44.entities.FacialVerification.list();
      const hasVerification = verifications.some(v => 
        v.user_email === userData.email && v.verification_status === 'verified'
      );
      setSecurityEnabled(hasVerification);

      const allCameras = await base44.entities.Camera.list("-created_date");
      const userCameras = allCameras.filter(c => c.user_email === userData.email);
      setCameras(userCameras);

      if (userCameras.length > 0 && !selectedCamera) {
        setSelectedCamera(userCameras[0]);
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  const gridOptions = [
    { value: 1, label: "1 Camera" },
    { value: 2, label: "2 Cameras" },
    { value: 4, label: "4 Cameras" },
    { value: 8, label: "8 Cameras" },
    { value: 16, label: "16 Cameras" }
  ];

  const onlineCameras = cameras.filter(c => c.status === "online").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading camera system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold metallic-text flex items-center gap-3">
              <Video className="w-10 h-10 text-cyan-400" />
              Live Stream Control
            </h1>
            <p className="text-gray-400 mt-2">
              Multi-camera surveillance with Face2Face biometric verification
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("Security")}>
              <Button className="bg-purple-500 hover:bg-purple-600 gap-2">
                <Shield className="w-4 h-4" />
                Trifecta Security
              </Button>
            </Link>
            <Link to={createPageUrl("NetworkScanner")}>
              <Button className="bg-purple-500 hover:bg-purple-600 gap-2">
                <Scan className="w-4 h-4" />
                Network Scanner
              </Button>
            </Link>
            <Link to={createPageUrl("CameraManager")}>
              <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                <Plus className="w-4 h-4" />
                Add Camera
              </Button>
            </Link>
          </div>
        </div>

        {/* Security Status */}
        {securityEnabled && (
          <Card className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 border-green-500/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-green-400" />
                <div className="flex-1">
                  <h3 className="text-white font-bold">Facial Recognition Active</h3>
                  <p className="text-gray-300 text-sm">
                    All cameras are using your verified biometric profile for enhanced security
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-2">
                  <Eye className="w-3 h-3" />
                  FR Enabled
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Bar */}
        <Card className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${onlineCameras > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-white font-semibold">
                    {onlineCameras} / {cameras.length} Online
                  </span>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {cameras.length} Total Cameras
                </Badge>
              </div>

              {/* Grid Layout Selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm mr-2">Grid:</span>
                {gridOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={gridLayout === option.value ? "default" : "outline"}
                    onClick={() => setGridLayout(option.value)}
                    className={gridLayout === option.value ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                  >
                    {option.value}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Cameras State */}
        {cameras.length === 0 ? (
          <Card className="bg-slate-900/50 border-cyan-500/20">
            <CardContent className="p-12 text-center">
              <Camera className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Cameras Added</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Add your first camera to start streaming. Use the Network Scanner to detect 
                cameras on your network automatically.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to={createPageUrl("NetworkScanner")}>
                  <Button className="bg-purple-500 hover:bg-purple-600 gap-2">
                    <Scan className="w-4 h-4" />
                    Scan Network
                  </Button>
                </Link>
                <Link to={createPageUrl("CameraManager")}>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Manually
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Camera Grid */}
            <CameraGrid 
              cameras={cameras.slice(0, gridLayout)}
              layout={gridLayout}
              onCameraSelect={setSelectedCamera}
              facialRecognitionEnabled={securityEnabled}
            />

            {/* Camera Controls */}
            {selectedCamera && (
              <CameraControls 
                camera={selectedCamera}
                onUpdate={loadData}
              />
            )}
          </>
        )}

        {/* Integration Notice */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Face2Face Integration Active</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  This surveillance system uses <strong className="text-cyan-400">Trifecta Security</strong> for 
                  biometric verification. All facial recognition data is encrypted with your unique biometric profile 
                  and stored in <strong className="text-cyan-400">The ARC</strong> database. 
                  Your data is never shared with third parties and can train your <strong className="text-cyan-400">Legacy AI</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}