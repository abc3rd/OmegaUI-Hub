import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Brain, Mic,
  Shield, Lock, Activity, Check, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LegacyAI() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({
    enabled: false,
    voice_cloning: false,
    personality_matching: false,
    auto_training: true,
    sandbox_isolated: true,
    encryption_level: "trifecta"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const userData = await base44.auth.me();
      setUser(userData);
      
      setConfig({
        enabled: userData.legacy_enabled || false,
        voice_cloning: false,
        personality_matching: true,
        auto_training: true,
        sandbox_isolated: true,
        encryption_level: "trifecta"
      });
    } catch (error) {
      console.error("Error loading Legacy AI config:", error);
      setError(error.message || "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (checked) => {
    try {
      setError(null);
      await base44.auth.updateMe({ legacy_enabled: checked });
      setConfig({ ...config, enabled: checked });
      
      // Update local user state
      if (user) {
        setUser({ ...user, legacy_enabled: checked });
      }
    } catch (error) {
      console.error("Error toggling Legacy AI:", error);
      setError("Failed to update Legacy AI status. Please try again.");
      
      // Revert the toggle
      setConfig({ ...config, enabled: !checked });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Legacy AI...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="bg-gradient-to-br from-red-900/30 to-slate-900/90 border-red-500/40 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button 
              onClick={loadData}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold metallic-text">Legacy AI</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-semibold">
            Set it. Forget it. Live forever.
          </p>
          <Link to={createPageUrl("LegacyInfo")}>
            <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-bold mt-4">
              Learn More About Legacy AI
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Control */}
        <Card className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#0f1419]/90 border-cyan-500/20 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">AI Pilot Status</div>
                  <div className="text-4xl font-bold text-white">
                    {config.enabled ? 'TRAINING' : 'STANDBY'}
                  </div>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={handleToggleEnabled}
                  className="data-[state=checked]:bg-cyan-500 scale-[2]"
                  disabled={!user}
                />
              </div>
              
              {config.enabled ? (
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2 text-lg">
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Actively Learning
                </Badge>
              ) : (
                <Badge className="bg-gray-700/50 text-gray-400 px-4 py-2 text-lg">
                  Inactive
                </Badge>
              )}
            </div>

            {config.enabled && (
              <Alert className="border-cyan-500/30 bg-cyan-500/10 mb-6">
                <AlertDescription className="text-cyan-100">
                  <strong>Automated Training Active:</strong> Your AI is learning from all connected sources 
                  24/7 in your private sandbox. Zero effort required from you.
                </AlertDescription>
              </Alert>
            )}

            {!config.enabled && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">
                  Enable Legacy AI to begin automated training. Your digital reflection 
                  will learn continuously in the background.
                </p>
                <Button 
                  onClick={() => handleToggleEnabled(true)}
                  disabled={!user}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 h-12 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Legacy AI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-[#1a1f2e]/50 border-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Voice Cloning</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Your AI speaks with your exact voice
                  </p>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Auto-Trained
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/50 border-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Personality Mirror</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Learns your attitudes, humor, and character
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/50 border-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Sandboxed AI</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Isolated container - no data sharing
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Isolated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1f2e]/50 border-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Trifecta Security</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Face + Retina + Fingerprint encryption
                  </p>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    3-Layer
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transitional Period */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-black text-white mb-6">
              The Transitional Period
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-slate-950/80 rounded-xl p-6 border-2 border-cyan-500/40">
                <div className="text-cyan-300 font-black text-xl mb-3">Pre-Legacy (Alive)</div>
                <p className="text-white text-base leading-relaxed">
                  You are the pilot. Your AI trains automatically from all your data. 
                  Test it, correct it, refine it.
                </p>
              </div>
              <div className="bg-slate-950/80 rounded-xl p-6 border-2 border-purple-500/40">
                <div className="text-purple-300 font-black text-xl mb-3">Legacy (After)</div>
                <p className="text-white text-base leading-relaxed">
                  Your verified Circle interacts with the AI you trained. 
                  Your wisdom, voice, and presence continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Matters */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-purple-500/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Why Legacy AI Changes Everything
            </h3>
            <div className="space-y-4 text-gray-200 leading-relaxed">
              <p className="flex items-start gap-3">
                <Check className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Grandchildren meet grandparents:</strong> Kids born after you're gone can still hear your voice, your stories, your wisdom.</span>
              </p>
              <p className="flex items-start gap-3">
                <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Family traditions live forever:</strong> Your recipes, your jokes, your advice - all preserved for future generations.</span>
              </p>
              <p className="flex items-start gap-3">
                <Check className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Your data = your asset:</strong> YOU own it. YOU monetize it. Not Google, not Facebook - YOU.</span>
              </p>
              <p className="flex items-start gap-3">
                <Check className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Set it and forget it:</strong> Zero manual work. It learns automatically from everything you do.</span>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}