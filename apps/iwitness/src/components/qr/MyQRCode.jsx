import React from "react";
import { QrCode, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MyQRCode({ referralCode, onClose }) {
  const referralUrl = `${window.location.origin}/Report?ref=${referralCode.affiliate_id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'iWitness - Emergency Accident Reporting',
          text: `Connect with me on iWitness. Use my referral code: ${referralCode.affiliate_id}`,
          url: referralUrl
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(referralUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (referralCode.qr_code_url) {
      const a = document.createElement('a');
      a.href = referralCode.qr_code_url;
      a.download = `iwitness-${referralCode.affiliate_id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR Code downloaded!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </Button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/30 mb-4">
            <QrCode className="w-4 h-4 text-[#ea00ea]" />
            <span className="text-sm font-medium text-white">My Referral Code</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Show This QR Code</h2>
          <p className="text-slate-400">Let others scan to connect with you</p>
        </div>

        {/* QR Code Display */}
        <div className="bg-white rounded-3xl p-8 mb-6 relative overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#ea00ea] rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#ea00ea] rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#ea00ea] rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#ea00ea] rounded-br-lg"></div>

          {referralCode.qr_code_url ? (
            <img 
              src={referralCode.qr_code_url} 
              alt="QR Code" 
              className="w-full aspect-square"
            />
          ) : (
            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Generating...</p>
              </div>
            </div>
          )}
        </div>

        {/* Affiliate ID Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 backdrop-blur-sm">
            <span className="text-slate-400 text-sm">Your Code:</span>
            <span className="text-2xl font-bold font-mono gradient-text">{referralCode.affiliate_id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            className="h-14 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!referralCode.qr_code_url}
            variant="outline"
            className="h-14 border-slate-700 text-white hover:bg-slate-800 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Have someone scan this code to report an accident through your referral link. 
            You'll earn credit for every qualified lead.
          </p>
        </div>
      </motion.div>

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