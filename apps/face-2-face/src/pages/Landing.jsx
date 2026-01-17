import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Shield, Users, Database, Lock, Brain,
  ArrowRight, Zap,
  Cloud, TrendingUp, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        navigate(createPageUrl("Dashboard"));
      }
      setIsAuthenticated(authed);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  const features = [
    {
      icon: Sparkles,
      title: "Legacy AI",
      description: "Train your AI on your life - live forever digitally",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Face to Face",
      description: "Verified human connections & anti-deepfake protection",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Cloud,
      title: "Cloud Connect",
      description: "Unified access to all your cloud accounts",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: Database,
      title: "The ARC",
      description: "Your personal data archive & monetization",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Legendary Leads",
      description: "AI-powered lead generation & management",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "ABC Dashboard",
      description: "Analytics, Business intelligence & Control",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Unhackable Identity",
      description: "Trifecta biometric encryption that AI can't fake"
    },
    {
      icon: Brain,
      title: "Your Digital Twin",
      description: "AI that learns from you and lives beyond you"
    },
    {
      icon: Lock,
      title: "Own Your Data",
      description: "You control it, you monetize it, not Big Tech"
    },
    {
      icon: Users,
      title: "Verified Humans Only",
      description: "Real face-to-face connections, no bots or fakes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <nav className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/c3693a1cd_Gemini_Generated_Image_4f4la64f4la64f4l.png"
                alt="Omega UI"
                className="h-10 w-auto"
              />
              <span className="text-2xl font-black metallic-text">OMEGA UI</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 font-bold px-8 h-12"
            >
              Sign In / Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/d3d11dd79_Gemini_Generated_Image_csiphhcsiphhcsip.png"
            alt="Omega UI"
            className="h-32 w-auto mx-auto mb-8"
          />
          <h1 className="text-6xl md:text-7xl font-black metallic-text mb-6">
            The Identity Platform<br />That Can't Be Faked
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-semibold">
            Prove you're you when everything can be faked. Own your data when Big Tech steals it. 
            Live forever when death was supposed to be the end.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-16 px-12 text-lg font-bold"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl("About"))}
              size="lg"
              variant="outline"
              className="h-16 px-12 text-lg font-bold border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-br from-red-900/30 to-slate-900/90 border-red-500/40">
          <CardContent className="p-10 md:p-16 text-center">
            <h2 className="text-4xl font-black text-white mb-6">The Crisis We're Solving</h2>
            <div className="space-y-4 text-xl text-gray-200 max-w-4xl mx-auto">
              <p>
                <strong className="text-red-300">Thousands of people lose access to their accounts permanently</strong> — locked out by lost phones, changed emails, or broken 2FA.
              </p>
              <p>
                <strong className="text-red-300">AI deepfakes are now indistinguishable from reality</strong> — scammers hijack accounts using voice clones and fake videos.
              </p>
              <p>
                <strong className="text-red-300">Big Tech monetizes YOUR data</strong> — Google, Facebook, Amazon profit billions while you get nothing.
              </p>
              <p>
                <strong className="text-red-300">When you die, everything disappears</strong> — your wisdom, memories, and digital presence vanish forever.
              </p>
            </div>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="mt-10 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-14 px-10 text-lg font-bold"
            >
              Join Omega UI - Fix This Forever
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-5xl font-black metallic-text text-center mb-16">
          Six Unified Platforms
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 border-cyan-500/20 hover:border-cyan-500/40 transition-all h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 text-base">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-5xl font-black metallic-text text-center mb-16">
          Why Omega UI Changes Everything
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-500/20 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                        <p className="text-gray-300 text-lg">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/40 shadow-2xl">
          <CardContent className="p-16 text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/c3693a1cd_Gemini_Generated_Image_4f4la64f4la64f4l.png"
              alt="Omega UI"
              className="h-24 w-auto mx-auto mb-8"
            />
            <h2 className="text-5xl font-black metallic-text mb-6">
              The End. The Beginning. The Omega.
            </h2>
            <p className="text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-medium">
              OMEGA UI is the final interface — unifying identity, data, and legacy into one unhackable platform. 
              <strong className="text-cyan-300"> Your data. Your AI. Your legacy. Forever.</strong>
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-16 px-16 text-xl font-black"
            >
              Join Omega UI Now
              <Zap className="ml-3 w-6 h-6" />
            </Button>
            <p className="text-gray-400 mt-6 text-sm">Free to start. No credit card required.</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-cyan-500/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/d3d11dd79_Gemini_Generated_Image_csiphhcsiphhcsip.png"
              alt="Omega UI"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold metallic-text-static">OMEGA UI</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 OmegaUI.com • The Identity Platform That Can't Be Faked
          </p>
        </div>
      </footer>
    </div>
  );
}