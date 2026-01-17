import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  TrendingUp,
  Users,
  DollarSign,
  Link as LinkIcon,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PartnerHub() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [referredLeads, setReferredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check if user has a referral code
      if (userData.affiliate_id) {
        const codes = await base44.entities.ReferralCode.filter({ 
          affiliate_id: userData.affiliate_id 
        });
        
        if (codes.length > 0) {
          setReferralCode(codes[0]);
          
          // Load referred leads
          const leads = await base44.entities.Lead.filter({ 
            referred_by: userData.affiliate_id 
          }, "-created_date");
          setReferredLeads(leads);
        }
      } else {
        // Generate affiliate ID for new partners
        await generateAffiliateId(userData);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateAffiliateId = async (userData) => {
    const firstName = (userData.full_name?.split(' ')[0] || 'USER').toUpperCase().substring(0, 4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const affiliateId = `${firstName}-${randomNum}`;

    // Update user with affiliate ID
    await base44.auth.updateMe({ 
      affiliate_id: affiliateId,
      user_role: userData.user_role === 'admin' ? 'admin' : 'partner'
    });

    // Create referral code record
    const newCode = await base44.entities.ReferralCode.create({
      affiliate_id: affiliateId,
      user_email: userData.email,
      total_referrals: 0,
      qualified_referrals: 0,
      is_active: true
    });

    setReferralCode(newCode);
    setUser({ ...userData, affiliate_id: affiliateId });
  };

  const generateQRCode = async () => {
    if (!referralCode) return;
    
    setGeneratingQR(true);
    try {
      const referralUrl = `${window.location.origin}/Report?ref=${referralCode.affiliate_id}`;
      
      // Use a QR code API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralUrl)}&bgcolor=0f172a&color=ea00ea`;
      
      await base44.entities.ReferralCode.update(referralCode.id, {
        qr_code_url: qrUrl
      });
      
      setReferralCode({ ...referralCode, qr_code_url: qrUrl });
      toast.success("QR Code generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate QR code");
    }
    setGeneratingQR(false);
  };

  const getReferralUrl = () => {
    if (!referralCode) return "";
    return `${window.location.origin}/Report?ref=${referralCode.affiliate_id}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getReferralUrl());
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'iWitness - Emergency Accident Reporting',
          text: 'Report your accident instantly and protect your rights',
          url: getReferralUrl()
        });
      } catch (e) {}
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ea00ea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Partner Hub</h1>
          </div>
          <p className="text-slate-400">Share your QR code and earn rewards for every referral</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ea00ea]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#ea00ea]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{referralCode?.total_referrals || 0}</p>
                  <p className="text-xs text-slate-400">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4bce2a]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#4bce2a]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{referralCode?.qualified_referrals || 0}</p>
                  <p className="text-xs text-slate-400">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2699fe]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#2699fe]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">${user?.total_earnings || 0}</p>
                  <p className="text-xs text-slate-400">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-mono">{referralCode?.affiliate_id || "---"}</p>
                  <p className="text-xs text-slate-400">Your Code</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link to={createPageUrl("Scan")} className="flex-1">
            <Button className="w-full h-16 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white font-bold text-lg">
              <QrCode className="w-6 h-6 mr-3" />
              Show My QR Code
            </Button>
          </Link>
        </div>

        {/* QR Code & Link Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* QR Code */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#ea00ea]" />
                Your QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {referralCode?.qr_code_url ? (
                <div className="p-4 bg-white rounded-2xl mb-4">
                  <img 
                    src={referralCode.qr_code_url} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <div className="w-56 h-56 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                  <QrCode className="w-16 h-16 text-slate-600" />
                </div>
              )}
              
              <Button
                onClick={generateQRCode}
                disabled={generatingQR}
                className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white hover:opacity-90"
              >
                {generatingQR ? "Generating..." : referralCode?.qr_code_url ? "Regenerate QR" : "Generate QR Code"}
              </Button>
              
              {referralCode?.qr_code_url && (
                <a 
                  href={referralCode.qr_code_url} 
                  download={`iwitness-${referralCode.affiliate_id}.png`}
                  className="mt-3"
                >
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Referral Link */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#2699fe]" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={getReferralUrl()}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    className="border-slate-700 text-white hover:bg-slate-800 px-3"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#4bce2a]" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  onClick={shareLink}
                  className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white hover:opacity-90"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
                  <ol className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#ea00ea]/20 text-[#ea00ea] flex items-center justify-center text-xs flex-shrink-0">1</span>
                      Share your QR code or link
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2699fe]/20 text-[#2699fe] flex items-center justify-center text-xs flex-shrink-0">2</span>
                      They scan & report their accident
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#4bce2a]/20 text-[#4bce2a] flex items-center justify-center text-xs flex-shrink-0">3</span>
                      You earn rewards for qualified leads
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4bce2a]" />
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {referredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-2">No referrals yet</p>
                <p className="text-slate-500 text-sm">Share your link to start earning</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {referredLeads.slice(0, 10).map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{lead.full_name || "Anonymous"}</p>
                      <p className="text-slate-500 text-sm">
                        {new Date(lead.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        lead.status === 'converted' 
                          ? "bg-[#4bce2a]/10 text-[#4bce2a] border-[#4bce2a]/30"
                          : lead.status === 'qualified'
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}