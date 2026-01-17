import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cloud, Shield, Smartphone, Eye,
  CheckCircle, Lock, Users, Zap, Link as LinkIcon,
  Facebook, Mail, Chrome, Twitter, Linkedin, Instagram
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CloudConnect() {
  const [user, setUser] = useState(null);
  const [trifectaComplete, setTrifectaComplete] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check Trifecta Security status
      const verifications = await base44.entities.FacialVerification.list();
      const hasVerification = verifications.some(v => 
        v.user_email === userData.email && v.verification_status === 'verified'
      );
      const hasRetina = userData.retina_verified || false;
      const hasFingerprint = userData.fingerprint_verified || false;
      setTrifectaComplete(hasVerification && hasRetina && hasFingerprint);

      // Load connected accounts
      const accounts = await base44.entities.ConnectedAccount.list();
      const userAccounts = accounts.filter(a => a.user_email === userData.email);
      setConnectedAccounts(userAccounts);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      name: "Google",
      icon: Chrome,
      description: "Gmail, Drive, Photos, Calendar - all Google services",
      color: "from-blue-500 to-green-500",
      recoveryEnabled: true
    },
    {
      name: "Facebook",
      icon: Facebook,
      description: "Facebook account and Messenger access",
      color: "from-blue-600 to-blue-700",
      recoveryEnabled: true
    },
    {
      name: "Yahoo",
      icon: Mail,
      description: "Yahoo Mail and services",
      color: "from-purple-600 to-purple-700",
      recoveryEnabled: true
    },
    {
      name: "Twitter",
      icon: Twitter,
      description: "Twitter/X account access",
      color: "from-cyan-500 to-blue-500",
      recoveryEnabled: true
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      description: "Professional network access",
      color: "from-blue-700 to-blue-800",
      recoveryEnabled: true
    },
    {
      name: "Instagram",
      icon: Instagram,
      description: "Instagram account recovery",
      color: "from-pink-500 to-purple-500",
      recoveryEnabled: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Cloud Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
            <Cloud className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold metallic-text">Cloud Connect</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-semibold">
            Never lose access again. Biometric recovery for all your accounts.
          </p>
        </motion.div>

        {/* Trifecta Status */}
        <Card className={`${
          trifectaComplete 
            ? "bg-gradient-to-br from-green-900/30 to-cyan-900/30 border-green-500/40" 
            : "bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/40"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {trifectaComplete ? (
                <Shield className="w-12 h-12 text-green-400" />
              ) : (
                <Lock className="w-12 h-12 text-yellow-400" />
              )}
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  {trifectaComplete ? "Trifecta Security Active" : "Complete Trifecta Security First"}
                </h3>
                <p className="text-gray-300 text-sm">
                  {trifectaComplete 
                    ? "Your biometric profile enables cloud account recovery across all platforms"
                    : "Set up Facial Recognition + Retina + Fingerprint to enable cloud recovery"
                  }
                </p>
              </div>
              {trifectaComplete ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ready
                </Badge>
              ) : (
                <Link to={createPageUrl("Security")}>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    Setup Now
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* The Problem */}
        <Card className="bg-gradient-to-br from-red-900/20 to-slate-900/90 border-red-500/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-red-400" />
              The 2FA Nightmare
            </h3>
            <div className="space-y-3 text-gray-200 leading-relaxed">
              <p className="text-lg">
                <strong className="text-red-400">Lost your phone?</strong> Now you can't access:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Your email (needs 2FA code sent to... your lost phone)</li>
                <li>Your bank (authenticator app on... your lost phone)</li>
                <li>Your social media (SMS code to... your lost phone)</li>
                <li>Your password manager (recovery email needs... 2FA from lost phone)</li>
              </ul>
              <p className="text-xl font-bold text-white mt-6 bg-red-500/20 p-4 rounded-lg border border-red-500/30">
                It's a circular trap. You need your phone to find your phone. It's madness.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/40 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-3xl flex items-center gap-3">
              <Zap className="w-10 h-10 text-cyan-400" />
              Face2Face + iWitness: The Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-cyan-500/30 bg-cyan-500/10">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <AlertDescription className="text-cyan-100 text-base">
                <strong className="text-xl">Your body IS your password.</strong> No device needed.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                  Multi-Factor Biometrics
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Facial Recognition:</strong>
                      <span className="text-gray-300"> AI-verified 3D facial mapping</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Retina Scan:</strong>
                      <span className="text-gray-300"> Unique iris pattern authentication</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Fingerprint:</strong>
                      <span className="text-gray-300"> Device biometric sensor</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Face2Face Link Code:</strong>
                      <span className="text-gray-300"> Verified peer connection</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">OTP Backup:</strong>
                      <span className="text-gray-300"> Time-based one-time password</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-cyan-400" />
                  iWitness Integration
                </h4>
                <div className="bg-slate-900/80 rounded-xl p-4 border border-cyan-500/20">
                  <p className="text-gray-200 leading-relaxed">
                    The <strong className="text-cyan-400">iWitness</strong> Android app captures 
                    dual-camera simultaneous selfies with your verified Circle members. This creates an 
                    <strong className="text-purple-400"> encrypted biometric bond</strong> that serves as 
                    proof of identity across all platforms.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to={createPageUrl("MobileCameraSync")} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 gap-2">
                      <Smartphone className="w-4 h-4" />
                      Setup iWitness
                    </Button>
                  </Link>
                  <Link to={createPageUrl("FaceToFace")} className="flex-1">
                    <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-400 gap-2">
                      <Users className="w-4 h-4" />
                      My Circle
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-slate-900/70 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">How Account Recovery Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                  1
                </div>
                <h4 className="font-bold text-white mb-2">Lost Device</h4>
                <p className="text-sm text-gray-400">
                  Your phone is lost/stolen. No access to 2FA codes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                  2
                </div>
                <h4 className="font-bold text-white mb-2">Borrow Device</h4>
                <p className="text-sm text-gray-400">
                  Use any device with internet. No need for your phone.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                  3
                </div>
                <h4 className="font-bold text-white mb-2">Biometric Verify</h4>
                <p className="text-sm text-gray-400">
                  Face + retina scan + Circle member verification via Face2Face.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                  4
                </div>
                <h4 className="font-bold text-white mb-2">Access Restored</h4>
                <p className="text-sm text-gray-400">
                  Instant access to all linked accounts. No phone needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supported Platforms */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Account Recovery Enabled For:</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isConnected = connectedAccounts.some(a => a.platform.toLowerCase() === platform.name.toLowerCase());
              
              return (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-slate-900/70 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{platform.name}</h3>
                          <p className="text-sm text-gray-400">{platform.description}</p>
                        </div>
                      </div>
                      
                      {trifectaComplete ? (
                        <div className="space-y-2">
                          {isConnected ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-full justify-center py-2">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Recovery Enabled
                            </Badge>
                          ) : (
                            <Button 
                              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                              disabled
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Link Account
                            </Button>
                          )}
                          <p className="text-xs text-gray-500 text-center">
                            Available when platform integration launches
                          </p>
                        </div>
                      ) : (
                        <Alert className="border-yellow-500/30 bg-yellow-500/10 p-3">
                          <AlertDescription className="text-yellow-200 text-xs">
                            Complete Trifecta Security first
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Security Guarantee */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Shield className="w-16 h-16 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Unhackable by Design
                </h3>
                <div className="space-y-3 text-gray-200">
                  <p className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Multi-factor biometrics:</strong> Face + retina + fingerprint + Face2Face link code = impossible to fake</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Circle verification:</strong> Recovery requires confirmation from verified Circle members via iWitness</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">ARC encrypted:</strong> All biometric data stored in your private ARC database, never shared</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Device-independent:</strong> Works from any device, anywhere. Your body is the key.</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        {!trifectaComplete && (
          <Card className="bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border-cyan-500/40">
            <CardContent className="p-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Never Lose Access Again?
              </h3>
              <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
                Set up your Trifecta Security profile now. Once complete, you'll have biometric 
                recovery for all your online accounts - no phone required.
              </p>
              <Link to={createPageUrl("Security")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-14 px-10 text-lg gap-3">
                  <Shield className="w-6 h-6" />
                  Setup Trifecta Security
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}