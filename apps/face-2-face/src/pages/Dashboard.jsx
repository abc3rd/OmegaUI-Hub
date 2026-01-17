
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Database, Shield, Users, Cloud, 
  TrendingUp, Activity, ArrowRight,
  Brain, BarChart3, ExternalLink, Code
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [platformStatus, setPlatformStatus] = useState({
    legacy_ai: false,
    face_to_face: false,
    cloud_connect: false,
    arc_storage: 0,
    security_level: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check platform statuses
      const verifications = await base44.entities.FacialVerification.list();
      const userVerification = verifications.find(v => 
        v.user_email === userData.email && 
        v.verification_status === 'verified'
      );

      // Check connections
      const connections = await base44.entities.Connection.list();
      const userConnections = connections.filter(c =>
        c.status === "accepted" &&
        (c.user_a === userData.email || c.user_b === userData.email)
      );

      // Calculate ARC storage
      let arcStorage = 0;
      if (userData.ai_training_data) {
        const memories = userData.ai_training_data.memories || [];
        arcStorage = Math.min(95, Math.floor(memories.length / 10));
      }

      // Calculate security level (out of 3 for trifecta)
      let securityLevel = 0;
      if (userVerification) securityLevel++;

      setPlatformStatus({
        legacy_ai: userData.legacy_enabled || false,
        face_to_face: !!userVerification,
        cloud_connect: false,
        arc_storage: arcStorage,
        security_level: securityLevel,
        connections_count: userConnections.length
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      name: "Legacy AI",
      description: "Train your AI on your life - live forever digitally",
      icon: Sparkles,
      status: platformStatus.legacy_ai,
      path: "LegacyInfo",
      color: "from-purple-500 to-pink-500",
      badge: platformStatus.legacy_ai ? "Active" : "Start Training"
    },
    {
      name: "Face to Face",
      description: "Verified human connections & anti-deepfake",
      icon: Users,
      status: platformStatus.face_to_face,
      path: "FaceToFaceInfo",
      color: "from-blue-500 to-cyan-500",
      badge: platformStatus.face_to_face ? `${platformStatus.connections_count} Connections` : "Setup Required"
    },
    {
      name: "Cloud Connect",
      description: "Unified access to all your cloud accounts",
      icon: Cloud,
      status: platformStatus.cloud_connect,
      path: "CloudConnect",
      color: "from-cyan-500 to-teal-500",
      badge: "Coming Soon"
    },
    {
      name: "The ARC",
      description: "Your personal data archive & monetization",
      icon: Database,
      status: platformStatus.arc_storage > 0,
      path: "ARC",
      color: "from-indigo-500 to-purple-500",
      badge: `${platformStatus.arc_storage}% Full`
    },
    {
      name: "Legendary Leads",
      description: "AI-powered lead generation & management",
      icon: TrendingUp,
      status: false,
      path: "LegendaryLeads",
      color: "from-amber-500 to-orange-500",
      badge: "Coming Soon"
    },
    {
      name: "ABC Dashboard",
      description: "Analytics, Business intelligence & Control",
      icon: BarChart3,
      status: false,
      path: "ABCDashboard",
      color: "from-green-500 to-emerald-500",
      badge: "Coming Soon"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Omega UI...</p>
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
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/d3d11dd79_Gemini_Generated_Image_csiphhcsiphhcsip.png"
            alt="Omega UI"
            className="h-24 w-auto mx-auto"
          />
          <h1 className="text-5xl font-bold metallic-text">Welcome to Omega UI</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-semibold">
            Your Unified Intelligence Platform
          </p>
        </motion.div>

        {/* Cloud Connect Features Quick Access */}
        <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cloud Connect Features</h3>
                  <p className="text-gray-400 text-sm">Manage your API endpoints and integrations</p>
                </div>
              </div>
              <a 
                href="https://hosted.glytch.cloud/functions" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 gap-2">
                  Open Functions
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1419]/90 border-cyan-500/20">
            <CardContent className="p-6">
              <Activity className="w-8 h-8 text-cyan-400 mb-3" />
              <div className="text-2xl font-bold text-white">{platformStatus.legacy_ai ? 'Active' : 'Standby'}</div>
              <div className="text-sm text-gray-400">AI Status</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1419]/90 border-purple-500/20">
            <CardContent className="p-6">
              <Database className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-2xl font-bold text-white">{platformStatus.arc_storage}%</div>
              <div className="text-sm text-gray-400">ARC Storage</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1419]/90 border-cyan-500/20">
            <CardContent className="p-6">
              <Shield className="w-8 h-8 text-cyan-400 mb-3" />
              <div className="text-2xl font-bold text-white">{Math.round((platformStatus.security_level / 3) * 100)}%</div>
              <div className="text-sm text-gray-400">Security</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1419]/90 border-purple-500/20">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-2xl font-bold text-white">{platformStatus.connections_count || 0}</div>
              <div className="text-sm text-gray-400">Connections</div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Grid */}
        <div>
          <h2 className="text-2xl font-bold metallic-text mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            Your Unified Platforms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={createPageUrl(platform.path)}>
                    <Card className="bg-gradient-to-br from-[#1a1f2e]/70 to-[#0f1419]/70 border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={`${
                            platform.status 
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                              : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {platform.badge}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {platform.description}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-full group-hover:bg-cyan-500/10 gap-2 text-gray-400 group-hover:text-cyan-400"
                        >
                          <span className="text-xs">Open Platform</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Omega Philosophy */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/40 shadow-2xl">
          <CardContent className="p-10 text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/c3693a1cd_Gemini_Generated_Image_4f4la64f4la64f4l.png"
              alt="Omega UI"
              className="h-20 w-auto mx-auto mb-6"
            />
            <h3 className="text-4xl font-black metallic-text mb-4">
              The End. The Beginning. The Omega.
            </h3>
            <p className="text-gray-200 max-w-3xl mx-auto leading-relaxed text-xl font-medium">
              OMEGA UI is the final interface — unifying Legacy AI, Face to Face verification, 
              Cloud Connect, The ARC data archive, and more. One platform. One identity. 
              Infinite possibilities. <strong className="text-cyan-300">Your data. Your AI. Your legacy. Forever.</strong>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
