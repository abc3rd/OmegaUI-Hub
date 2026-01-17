import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Camera, Users, Zap, QrCode, 
  CheckCircle, WifiOff, Wifi, Eye, ArrowLeft, Download,
  Shield, Lock, Fingerprint, Link as LinkIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MobileCameraSync() {
  const [user, setUser] = useState(null);
  const [syncCode, setSyncCode] = useState("");
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    loadData();
    generateSyncCode();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const cameras = await base44.entities.Camera.list();
      const mobileDevices = cameras.filter(c => 
        c.user_email === userData.email && 
        (c.camera_type === "phone" || c.camera_type === "body_cam")
      );
      setConnectedDevices(mobileDevices);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSyncCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSyncCode(code);
  };

  const activeDualCamera = connectedDevices.filter(d => d.status === "online").length >= 2;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link to={createPageUrl("NetworkScanner")}>
          <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scanner
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold metallic-text">
              iWitness Mobile Sync
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
              Connect the iWitness Android app for Face2Face dual-camera simultaneous capture and biometric account recovery
            </p>
          </motion.div>
        </div>

        {/* App Download */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-purple-500/40">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                  <Camera className="w-16 h-16 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">iWitness App</h3>
                <p className="text-gray-300 mb-4">
                  Download the iWitness Android app to enable dual-camera Face2Face capture, 
                  biometric account recovery, and live streaming integration.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button className="bg-green-600 hover:bg-green-700 gap-2" disabled>
                    <Download className="w-4 h-4" />
                    Download on Google Play
                  </Button>
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400" disabled>
                    <Download className="w-4 h-4" />
                    Direct APK Download
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Coming Soon • Currently in Development
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Code Card */}
        <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/40">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6 text-cyan-400" />
              Sync Connection Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-block bg-white p-8 rounded-2xl shadow-2xl mb-4">
                <div className="text-6xl font-black text-slate-900 tracking-wider">
                  {syncCode}
                </div>
              </div>
              <p className="text-gray-300">
                Enter this code in the iWitness Android app to sync with Omega UI
              </p>
            </div>

            <Alert className="border-cyan-500/30 bg-cyan-500/10">
              <Zap className="w-4 h-4 text-cyan-400" />
              <AlertDescription className="text-cyan-100">
                <strong>How to sync:</strong> Open iWitness app → Tap "Connect to Omega UI" → Enter code: <strong className="text-cyan-300">{syncCode}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Face2Face Features */}
        <Card className="bg-slate-900/70 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Face2Face with iWitness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Simultaneous Dual-Camera</h4>
                  <p className="text-gray-400 text-sm">
                    Both users' phones capture facial data at the exact same moment, creating 
                    an encrypted biometric bond that proves you met in person.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Trifecta Capture</h4>
                  <p className="text-gray-400 text-sm">
                    Captures facial recognition, retina scan data (if device supports), and 
                    fingerprint biometrics for maximum security verification.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Account Recovery</h4>
                  <p className="text-gray-400 text-sm">
                    Lost your phone? Your verified Circle members can help you recover all 
                    your accounts using Face2Face verification - no device needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">ARC Integration</h4>
                  <p className="text-gray-400 text-sm">
                    All Face2Face data is encrypted and stored in your private ARC database. 
                    Used for Legacy AI training and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card className="bg-slate-900/70 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Connected Mobile Devices</span>
              {activeDualCamera && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Dual-Camera Ready
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedDevices.length === 0 ? (
              <div className="text-center py-12">
                <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No mobile devices connected</p>
                <p className="text-gray-500 text-sm mt-2">Use the sync code above to connect your iWitness app</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="bg-slate-800/50 border-cyan-500/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-bold">{device.camera_name}</p>
                              <p className="text-gray-400 text-sm">{device.camera_type}</p>
                              <p className="text-gray-500 text-xs">{device.ip_address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {device.status === "online" ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-2">
                                <Wifi className="w-3 h-3" />
                                Online
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-2">
                                <WifiOff className="w-3 h-3" />
                                Offline
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Recovery Process */}
        <Card className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <LinkIcon className="w-7 h-7 text-green-400" />
              How iWitness Enables Account Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-cyan-500/30 bg-cyan-500/10">
              <Shield className="w-5 h-5 text-cyan-400" />
              <AlertDescription className="text-cyan-100">
                <strong>The Problem:</strong> Lost your phone? Can't get 2FA codes? Locked out of everything.
                <br/>
                <strong className="text-cyan-300">The Solution:</strong> Your Circle members verify you via Face2Face. Your body IS the password.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white">
                  1
                </div>
                <h4 className="font-bold text-white mb-2">Lost Device</h4>
                <p className="text-sm text-gray-400">
                  Your phone with all your 2FA apps is gone. You can't access Google, Facebook, Yahoo, etc.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white">
                  2
                </div>
                <h4 className="font-bold text-white mb-2">Face2Face Verify</h4>
                <p className="text-sm text-gray-400">
                  Meet a Circle member in person. Use iWitness to do a dual-camera Face2Face scan.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white">
                  3
                </div>
                <h4 className="font-bold text-white mb-2">Access Restored</h4>
                <p className="text-sm text-gray-400">
                  Your biometric profile + Circle verification = instant access to all accounts.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-6 border border-green-500/20">
              <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-green-400" />
                Multi-Factor Verification Required:
              </h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Your facial recognition profile (from Trifecta)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Retina scan match (if available)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Fingerprint verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Face2Face scan with verified Circle member
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  OTP backup code (optional)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Development Notice */}
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertDescription className="text-yellow-100 text-sm">
            <strong>Development Status:</strong> The iWitness Android app is currently under development. 
            This sync interface will be fully functional once the app is released. Platform integration 
            with Google, Facebook, Yahoo, and other services coming Q1 2026.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}