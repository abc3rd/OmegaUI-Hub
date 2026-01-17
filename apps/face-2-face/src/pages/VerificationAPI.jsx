
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code, Copy, CheckCircle, Shield, Key, Zap,
  Globe, Lock, ExternalLink,
  Facebook, Instagram, Twitter, Linkedin, Mail,
  Smartphone
} from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationAPI() {
  const [user, setUser] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Load verification token
      const tokens = await base44.entities.VerificationToken.list();
      const userToken = tokens.find(t => t.user_email === userData.email && t.is_active);
      setVerificationToken(userToken);

      // Generate or get API key for developers
      if (userData.role === 'admin') {
        const existingKey = userData.api_key || generateAPIKey();
        setApiKey(existingKey);
        if (!userData.api_key) {
          await base44.auth.updateMe({ api_key: existingKey });
        }
      }
    } catch (error) {
      console.error("Error loading API data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = () => {
    return 'omega_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const baseUrl = window.location.origin;

  const endpoints = [
    {
      name: "Verify Identity",
      method: "POST",
      path: "/functions/verifyIdentity",
      description: "Verify a user's identity using their Trifecta verification token",
      request: {
        verification_token: "F2F_abc123...",
        platform: "facebook",
        requesting_user_id: "platform_user_id_123"
      },
      response: {
        success: true,
        verified: true,
        verification_data: {
          user_id: "user@example.com",
          full_name: "John Doe",
          verified_connections: 15,
          verification_level: "gold",
          is_human_verified: true,
          anti_deepfake_protected: true
        }
      }
    },
    {
      name: "Account Recovery",
      method: "POST",
      path: "/functions/accountRecovery",
      description: "Allow users to recover their account using Trifecta biometrics when locked out",
      request: {
        platform: "instagram",
        platform_user_id: "instagram_123456",
        biometric_challenge: "live_verification_required"
      },
      response: {
        success: true,
        recovery_url: "https://omegaui.com/recovery/verify?session=xyz",
        expires_in: 300
      }
    },
    {
      name: "Link Social Account",
      method: "POST",
      path: "/functions/linkSocialAccount",
      description: "Connect a user's Omega UI identity to their social media account",
      request: {
        verification_token: "F2F_abc123...",
        platform: "twitter",
        platform_user_id: "twitter_user_id",
        platform_username: "@johndoe"
      },
      response: {
        success: true,
        linked: true,
        verification_badge_url: "https://cdn.omegaui.com/badges/verified.png"
      }
    },
    {
      name: "Check Verification Status",
      method: "GET",
      path: "/functions/checkVerificationStatus",
      description: "Check if a platform user has Omega UI verification",
      request: {
        platform: "facebook",
        platform_user_id: "fb_user_123"
      },
      response: {
        success: true,
        is_verified: true,
        verification_level: "silver",
        verification_date: "2024-01-15T10:30:00Z"
      }
    }
  ];

  const platformIntegrations = [
    {
      name: "Facebook",
      icon: Facebook,
      status: "Available",
      color: "bg-blue-600",
      endpoint: "/functions/oauth/facebookConnect"
    },
    {
      name: "Instagram",
      icon: Instagram,
      status: "Available",
      color: "bg-pink-600",
      endpoint: "/functions/oauth/instagramConnect"
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      status: "Available",
      color: "bg-sky-500",
      endpoint: "/functions/oauth/twitterConnect"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      status: "Available",
      color: "bg-blue-700",
      endpoint: "/functions/oauth/linkedinConnect"
    },
    {
      name: "Gmail",
      icon: Mail,
      status: "Coming Soon",
      color: "bg-red-600",
      endpoint: null
    },
    {
      name: "TikTok",
      icon: Smartphone,
      status: "Coming Soon",
      color: "bg-black",
      endpoint: null
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <Code className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black metallic-text">Verification API</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Integrate Omega UI's Trifecta verification into your platform for unhackable identity verification and account recovery.
          </p>
        </motion.div>

        {/* Your Verification Token */}
        {verificationToken && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-2xl">
            <CardHeader className="border-b border-cyan-500/20 bg-black/40">
              <CardTitle className="flex items-center gap-3 text-white">
                <Key className="w-6 h-6 text-cyan-400" />
                Your Verification Token
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-300 mb-4">
                Use this token to link your Omega UI identity to social media platforms and services:
              </p>
              <div className="flex gap-3">
                <Input
                  value={verificationToken.token}
                  readOnly
                  className="font-mono text-white bg-black/60 border-cyan-500/30"
                />
                <Button
                  onClick={() => copyToClipboard(verificationToken.token, 'token')}
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400"
                >
                  {copiedEndpoint === 'token' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Used {verificationToken.usage_count} times • Expires {new Date(verificationToken.expires_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Integrations */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 shadow-2xl">
          <CardHeader className="border-b border-purple-500/20 bg-black/40">
            <CardTitle className="flex items-center gap-3 text-white">
              <Globe className="w-6 h-6 text-purple-400" />
              Supported Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-300 mb-6">
              These platforms can integrate with Omega UI for account verification and recovery:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {platformIntegrations.map((platform, idx) => {
                const Icon = platform.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * idx }}
                  >
                    <Card className="bg-black/40 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-white font-bold mb-2">{platform.name}</h3>
                        <Badge className={platform.status === "Available" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-gray-700/50 text-gray-400"}>
                          {platform.status}
                        </Badge>
                        {platform.endpoint && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full mt-3 text-cyan-400 hover:bg-cyan-500/10"
                            onClick={() => window.open(baseUrl + platform.endpoint, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-2xl">
          <CardHeader className="border-b border-cyan-500/20 bg-black/40">
            <CardTitle className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 text-cyan-400" />
              API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="verify" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-black/60 border border-cyan-500/20">
                <TabsTrigger value="verify">Verify</TabsTrigger>
                <TabsTrigger value="recovery">Recovery</TabsTrigger>
                <TabsTrigger value="link">Link Account</TabsTrigger>
                <TabsTrigger value="status">Status Check</TabsTrigger>
              </TabsList>

              {endpoints.map((endpoint, idx) => (
                <TabsContent key={idx} value={endpoint.name.toLowerCase().replace(/\s+/g, '')}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-white">{endpoint.name}</h3>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                          {endpoint.method}
                        </Badge>
                      </div>
                      <p className="text-gray-300 mb-4">{endpoint.description}</p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 font-mono text-sm">
                          {baseUrl}{endpoint.path}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(baseUrl + endpoint.path, endpoint.name)}
                          variant="outline"
                          size="icon"
                          className="border-cyan-500/30 text-cyan-400"
                        >
                          {copiedEndpoint === endpoint.name ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white mb-3">Request Example</h4>
                      <pre className="bg-black/80 border border-cyan-500/30 rounded-lg p-4 overflow-x-auto">
                        <code className="text-cyan-300 text-sm">{JSON.stringify(endpoint.request, null, 2)}</code>
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white mb-3">Response Example</h4>
                      <pre className="bg-black/80 border border-purple-500/30 rounded-lg p-4 overflow-x-auto">
                        <code className="text-purple-300 text-sm">{JSON.stringify(endpoint.response, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Integration Guide */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-purple-500/40 shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-3xl font-black metallic-text mb-6">Quick Integration Guide</h2>
            <div className="space-y-6">
              <div className="bg-black/40 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-xl font-bold cyan-metallic mb-3">For Platform Developers</h3>
                <ol className="space-y-3 text-gray-100 leading-relaxed font-medium">
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">1.</span>
                    <span><strong className="text-white">Add "Verify with Omega UI" button</strong> to your account settings page</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">2.</span>
                    <span><strong className="text-white">User clicks button:</strong> Redirect to {baseUrl}/verify with your platform callback URL</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">3.</span>
                    <span><strong className="text-white">User completes Trifecta verification:</strong> We redirect back with verification token</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">4.</span>
                    <span><strong className="text-white">Store the token:</strong> Save it in your database linked to the user's account</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">5.</span>
                    <span><strong className="text-white">Account recovery:</strong> When user is locked out, call our Recovery API with their token</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cyan-metallic font-bold">6.</span>
                    <span><strong className="text-white">Instant unlock:</strong> We verify their biometrics and confirm - you restore their access</span>
                  </li>
                </ol>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-6 border border-cyan-500/30">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Benefits for Your Platform
                  </h4>
                  <ul className="space-y-2 text-gray-200 text-sm">
                    <li>• Eliminate 90%+ of account recovery support tickets</li>
                    <li>• Stop AI deepfake impersonation attacks</li>
                    <li>• Improve user retention (no more lost accounts)</li>
                    <li>• Easy REST API integration (&lt; 1 day)</li>
                    <li>• Premium feature to differentiate from competitors</li>
                  </ul>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Security Features
                  </h4>
                  <ul className="space-y-2 text-gray-200 text-sm">
                    <li>• Three-factor biometric verification</li>
                    <li>• Zero-knowledge architecture</li>
                    <li>• AES-256 encryption</li>
                    <li>• Anti-deepfake protocol</li>
                    <li>• GDPR & CCPA compliant</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
