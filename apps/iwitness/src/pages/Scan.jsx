import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QRScanner from "../components/qr/QRScanner";
import MyQRCode from "../components/qr/MyQRCode";
import { 
  QrCode, 
  Scan as ScanIcon, 
  Users, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Scan() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null, 'scan', 'show'
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);

        // Load referral code if partner
        if (userData.affiliate_id) {
          const codes = await base44.entities.ReferralCode.filter({ 
            affiliate_id: userData.affiliate_id 
          });
          if (codes.length > 0) {
            setReferralCode(codes[0]);
            
            // Auto-generate QR if doesn't exist
            if (!codes[0].qr_code_url) {
              await generateQRCode(codes[0]);
            }
          }
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const generateQRCode = async (code) => {
    const referralUrl = `${window.location.origin}/Report?ref=${code.affiliate_id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralUrl)}&bgcolor=0f172a&color=ea00ea`;
    
    await base44.entities.ReferralCode.update(code.id, {
      qr_code_url: qrUrl
    });
    
    setReferralCode({ ...code, qr_code_url: qrUrl });
  };

  const handleScanSuccess = (ref) => {
    // Store referral code and redirect to Report page
    localStorage.setItem("iwitness_referrer", ref);
    navigate(createPageUrl("Report") + `?ref=${ref}`);
  };

  const isPartner = user?.user_role === 'partner' || user?.user_role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-[#ea00ea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show scanner
  if (mode === 'scan') {
    return (
      <QRScanner 
        onScanSuccess={handleScanSuccess}
        onClose={() => setMode(null)}
      />
    );
  }

  // Show My QR Code
  if (mode === 'show' && referralCode) {
    return (
      <MyQRCode 
        referralCode={referralCode}
        onClose={() => setMode(null)}
      />
    );
  }

  // Main selection screen
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ea00ea]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2699fe]/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/30 mb-6">
            <QrCode className="w-4 h-4 text-[#ea00ea]" />
            <span className="text-sm font-medium text-white">QR Code Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Connect & Refer
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Scan a partner's code to report an accident, or show yours to earn referrals
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Scan QR */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              onClick={() => setMode('scan')}
              className="bg-slate-900/50 border-slate-800 hover:border-[#2699fe]/50 transition-all cursor-pointer overflow-hidden group"
            >
              <CardContent className="p-8 text-center relative">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2699fe]/0 to-[#2699fe]/0 group-hover:from-[#2699fe]/10 group-hover:to-[#2699fe]/5 transition-all" />
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#2699fe]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2699fe]/20 transition-all">
                    <ScanIcon className="w-10 h-10 text-[#2699fe]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Scan QR Code</h3>
                  <p className="text-slate-400 mb-6">
                    Scan a partner's QR code to report your accident through their referral
                  </p>
                  <div className="inline-flex items-center gap-2 text-[#2699fe] font-medium">
                    Open Scanner
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Show My QR */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              onClick={() => {
                if (!isPartner) {
                  // Redirect to partner hub to become partner
                  navigate(createPageUrl("PartnerHub"));
                } else if (referralCode) {
                  setMode('show');
                }
              }}
              className="bg-slate-900/50 border-slate-800 hover:border-[#ea00ea]/50 transition-all cursor-pointer overflow-hidden group relative"
            >
              {!isPartner && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-3 py-1 rounded-full bg-[#4bce2a]/20 border border-[#4bce2a]/40 text-[#4bce2a] text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Become Partner
                  </div>
                </div>
              )}
              
              <CardContent className="p-8 text-center relative">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ea00ea]/0 to-[#ea00ea]/0 group-hover:from-[#ea00ea]/10 group-hover:to-[#ea00ea]/5 transition-all" />
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#ea00ea]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ea00ea]/20 transition-all">
                    <QrCode className="w-10 h-10 text-[#ea00ea]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">My QR Code</h3>
                  <p className="text-slate-400 mb-6">
                    {isPartner 
                      ? "Show your QR code to others so they can report through your referral"
                      : "Become a partner to get your own referral QR code and earn rewards"
                    }
                  </p>
                  <div className="inline-flex items-center gap-2 text-[#ea00ea] font-medium">
                    {isPartner ? "Show My Code" : "Join Program"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats/Info */}
        {isPartner && referralCode && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Your Referral Stats</p>
                    <p className="text-lg font-bold text-white">
                      {referralCode.total_referrals || 0} Referrals • {referralCode.qualified_referrals || 0} Qualified
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("PartnerHub"))}
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 text-center">How QR Referrals Work</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#ea00ea]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#ea00ea]">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Become a Partner</p>
                <p className="text-sm text-slate-400">Sign up and get your unique QR code instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#2699fe]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#2699fe]">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Share Your Code</p>
                <p className="text-sm text-slate-400">Show your QR to accident victims or share your link</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#4bce2a]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#4bce2a]">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Earn Rewards</p>
                <p className="text-sm text-slate-400">Get credit for every qualified lead you refer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}