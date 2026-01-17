import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database, HardDrive, Lock, Download,
  Facebook, Instagram, Twitter, Linkedin, Mail,
  Image, FileText, Video, Music, Check, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function ARC() {
  const [user, setUser] = useState(null);
  const [arcData, setArcData] = useState({
    total_size_gb: 0,
    data_points: 0,
    connected_sources: [],
    categories: {
      social_media: 0,
      photos: 0,
      documents: 0,
      emails: 0,
      videos: 0,
      audio: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Simulate ARC data (in production, this would come from actual integrations)
      const connectedAccounts = await base44.entities.ConnectedAccount.list();
      const userAccounts = connectedAccounts.filter(a => a.user_email === userData.email);

      setArcData({
        total_size_gb: Math.random() * 50 + 10,
        data_points: Math.floor(Math.random() * 10000) + 5000,
        connected_sources: userAccounts,
        categories: {
          social_media: Math.floor(Math.random() * 5000) + 1000,
          photos: Math.floor(Math.random() * 3000) + 500,
          documents: Math.floor(Math.random() * 2000) + 300,
          emails: Math.floor(Math.random() * 10000) + 2000,
          videos: Math.floor(Math.random() * 500) + 100,
          audio: Math.floor(Math.random() * 300) + 50
        }
      });
    } catch (error) {
      console.error("Error loading ARC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dataSources = [
    { name: "Facebook", icon: Facebook, connected: true, data_points: arcData.categories.social_media },
    { name: "Instagram", icon: Instagram, connected: true, data_points: arcData.categories.social_media },
    { name: "Twitter", icon: Twitter, connected: false, data_points: 0 },
    { name: "LinkedIn", icon: Linkedin, connected: false, data_points: 0 },
    { name: "Gmail", icon: Mail, connected: true, data_points: arcData.categories.emails },
    { name: "Google Drive", icon: HardDrive, connected: true, data_points: arcData.categories.documents },
  ];

  const categoryIcons = {
    social_media: { icon: Facebook, color: "text-blue-400" },
    photos: { icon: Image, color: "text-pink-400" },
    documents: { icon: FileText, color: "text-green-400" },
    emails: { icon: Mail, color: "text-yellow-400" },
    videos: { icon: Video, color: "text-purple-400" },
    audio: { icon: Music, color: "text-cyan-400" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading The ARC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            The ARC
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Your personal data archive. Redundant. Secure. Yours to monetize.
          </p>
        </motion.div>

        {/* Storage Overview */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-500/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <HardDrive className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">
                  {arcData.total_size_gb.toFixed(1)} GB
                </div>
                <div className="text-sm text-slate-400">Total Archived</div>
              </div>

              <div className="text-center">
                <Database className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">
                  {arcData.data_points.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Data Points</div>
              </div>

              <div className="text-center">
                <Lock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                  <Check className="w-8 h-8 text-green-400" />
                  100%
                </div>
                <div className="text-sm text-slate-400">Encrypted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Data Categories</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(arcData.categories).map(([category, count]) => {
              const config = categoryIcons[category];
              const Icon = config.icon;
              return (
                <Card key={category} className="bg-slate-900/50 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${config.color}`} />
                      <Badge className="bg-white/10 text-white">
                        {count.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-white capitalize mb-1">
                      {category.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-slate-400">items archived</div>
                    <Progress value={75} className="h-1 mt-3 bg-slate-800" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Connected Sources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Connected Sources</h2>
            <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
              <Plus className="w-4 h-4 mr-2" />
              Connect More
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => {
              const Icon = source.icon;
              return (
                <Card 
                  key={source.name}
                  className={`${
                    source.connected 
                      ? 'bg-slate-900/50 border-green-500/20' 
                      : 'bg-slate-900/30 border-white/5'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8 text-white" />
                      {source.connected ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-700/50 text-slate-400">
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <div className="text-lg font-bold text-white mb-1">{source.name}</div>
                    {source.connected ? (
                      <div className="text-sm text-slate-400">
                        {source.data_points.toLocaleString()} items synced
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="mt-2 w-full border-cyan-500/30 text-cyan-400">
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-purple-500/20">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Your Data = Your Currency
                </h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  The ARC doesn't just store your data — it makes you the database. 
                  Every data point increases your share in the collective value. 
                  When companies want access, YOU get paid. Not Google. Not Facebook. You.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export Your Data
                  </Button>
                  <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                    View Data Value
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}