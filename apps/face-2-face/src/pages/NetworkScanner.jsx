import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { scanNetwork } from "@/functions/scanNetwork";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Scan, Wifi, Camera, Plus,
  CheckCircle, Loader2, Network, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NetworkScanner() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [ipRange, setIpRange] = useState("192.168.1");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const allDevices = await base44.entities.NetworkDevice.list("-created_date");
      const userDevices = allDevices.filter(d => d.user_email === userData.email);
      setDevices(userDevices);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScanProgress(0);
    setScanResults(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 5, 95));
      }, 200);

      const response = await scanNetwork({ ipRange });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      if (response.data.success) {
        setScanResults(response.data);
        await loadData();
      } else {
        alert("Scan failed: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert("Network scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const addCameraFromDevice = async (device) => {
    try {
      await base44.entities.Camera.create({
        user_email: user.email,
        camera_name: device.hostname || device.ip_address,
        camera_type: "security_cam",
        ip_address: device.ip_address,
        mac_address: device.mac_address,
        make: device.manufacturer,
        model: device.model,
        firmware_version: device.firmware_info?.version,
        status: "offline"
      });
      alert("Camera added successfully!");
      await loadData();
    } catch (error) {
      console.error("Error adding camera:", error);
      alert("Failed to add camera");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold metallic-text flex items-center gap-3">
              <Scan className="w-10 h-10 text-purple-400" />
              Network Scanner
            </h1>
            <p className="text-gray-400 mt-2">
              Detect cameras and devices on your network
            </p>
          </div>
          <Link to={createPageUrl("MobileCameraSync")}>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile App Sync
            </Button>
          </Link>
        </div>

        {/* Scanner Control */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Scanner Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ipRange" className="text-gray-300">IP Range to Scan</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="ipRange"
                  value={ipRange}
                  onChange={(e) => setIpRange(e.target.value)}
                  placeholder="192.168.1"
                  className="bg-slate-800 border-slate-700 text-white"
                  disabled={scanning}
                />
                <Button 
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-purple-500 hover:bg-purple-600 gap-2 min-w-[140px]"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {scanning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Scanning network...</span>
                  <span className="text-purple-400 font-mono">{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}

            {scanResults && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-100">
                  <strong>Scan Complete:</strong> Found {scanResults.devices_found} devices on network
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Discovered Devices */}
        <Card className="bg-slate-900/70 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Discovered Devices</span>
              {devices.length > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {devices.length} devices
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="text-center py-12">
                <Wifi className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No devices scanned yet</p>
                <p className="text-gray-500 text-sm mt-2">Run a network scan to discover devices</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {devices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="bg-slate-800/50 border-purple-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {device.is_camera ? (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-white" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                                  <Wifi className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="text-white font-bold">{device.hostname || device.ip_address}</p>
                                <p className="text-gray-400 text-sm">
                                  {device.ip_address} • {device.mac_address}
                                </p>
                                {device.manufacturer && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    {device.manufacturer} {device.model}
                                  </p>
                                )}
                                {device.firmware_info && (
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      FW: {device.firmware_info.version}
                                    </Badge>
                                    {device.firmware_info.update_available && (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs border-yellow-500/30">
                                        Update Available
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {device.is_camera && (
                                <>
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    Camera Device
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => addCameraFromDevice(device)}
                                    className="bg-cyan-500 hover:bg-cyan-600 gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add as Camera
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}