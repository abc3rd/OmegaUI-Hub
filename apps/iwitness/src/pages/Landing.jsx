import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  AlertTriangle, 
  QrCode, 
  Shield, 
  Camera,
  MapPin,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Landing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ea00ea]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2699fe]/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">iWitness</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={createPageUrl("Dashboard")}>
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                {(user.user_role === 'partner' || user.user_role === 'admin') && (
                  <Link to={createPageUrl("PartnerHub")}>
                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                      Partner Hub
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea00ea]/10 border border-[#ea00ea]/30 text-[#ea00ea] mb-8">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Protect Your Rights</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Document Your Incident<br />
              <span className="gradient-text">Protect Your Rights</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Fast, secure incident reporting with GPS tracking, photo evidence, and instant documentation.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to={createPageUrl("Report")}>
                <Button className="h-14 px-8 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white font-bold text-lg">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report an Incident
                </Button>
              </Link>

              <Link to={createPageUrl("Scan")}>
                <Button 
                  variant="outline" 
                  className="h-14 px-8 border-slate-700 text-white hover:bg-slate-800 font-bold text-lg"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 italic">
              Not legal advice. No outcome guaranteed.
            </p>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[#ea00ea]/10 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-[#ea00ea]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Documentation</h3>
                <p className="text-slate-400">
                  Capture photos, location, and details immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[#2699fe]/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-[#2699fe]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">GPS Tracking</h3>
                <p className="text-slate-400">
                  Automatic location capture with precise coordinates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[#4bce2a]/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#4bce2a]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
                <p className="text-slate-400">
                  Your data is encrypted and protected.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Incident Types */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">We Support All Incident Types</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Auto Accidents",
                "Slip & Fall",
                "Workers' Comp",
                "Pedestrian/Bike",
                "Dog Bites",
                "Product Injuries",
                "Medical Events",
                "Property Damage"
              ].map((type, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 text-sm"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Program CTA */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-gradient-to-br from-[#ea00ea]/10 to-[#2699fe]/10 border-[#ea00ea]/30">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4bce2a]/20 border border-[#4bce2a]/40 text-[#4bce2a] mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Partner Program</span>
                </div>

                <h2 className="text-4xl font-bold text-white mb-4">
                  Earn Rewards for Every Referral
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Join our partner network and earn credit for every qualified lead.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <QrCode className="w-6 h-6 text-[#ea00ea]" />
                    </div>
                    <p className="text-white font-medium">Get Your QR Code</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-[#2699fe]" />
                    </div>
                    <p className="text-white font-medium">Share & Connect</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-[#4bce2a]" />
                    </div>
                    <p className="text-white font-medium">Earn Rewards</p>
                  </div>
                </div>

                <Link to={createPageUrl("PartnerHub")}>
                  <Button className="h-14 px-8 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white font-bold text-lg">
                    Join Partner Program
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-20">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <p className="text-slate-500 text-sm text-center">
              This app helps document incidents and connect you with assistance. It is not legal advice and does not guarantee compensation.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #ea00ea, #2699fe, #4bce2a);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}