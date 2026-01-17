import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Mail,
  MessageSquare,
  Share2,
  Users,
  TrendingUp,
} from "lucide-react";

export default function ShareModal({ onClose, accounts }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Check out U-CRASH Social Hub");
    const body = encodeURIComponent(
      `Connect with U-CRASH on all social platforms:\n\n${pageUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSMSShare = () => {
    const message = encodeURIComponent(
      `Check out U-CRASH Social Hub: ${pageUrl}`
    );
    window.open(`sms:?body=${message}`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "U-CRASH Social Hub",
          text: "Connect with us on all social platforms",
          url: pageUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.follower_count || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] bg-clip-text text-transparent">
            Share Social Hub
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-[#ea00ea] via-[#8b00ff] to-[#0080ff] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-90" />
                <p className="text-3xl font-bold">{accounts.length}</p>
                <p className="text-sm opacity-90">Platforms</p>
              </div>
              <div className="h-16 w-px bg-white/30" />
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-90" />
                <p className="text-3xl font-bold">{totalFollowers.toLocaleString()}</p>
                <p className="text-sm opacity-90">Total Followers</p>
              </div>
            </div>
          </div>

          {/* URL Copy */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input value={pageUrl} readOnly className="flex-1 bg-gray-50" />
              <Button
                onClick={handleCopy}
                className={`transition-all ${
                  copied
                    ? 'bg-[#00ff80] hover:bg-[#00e070] text-gray-900'
                    : 'bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] hover:from-[#d000d0] hover:to-[#7a00e6] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <Label>Share via</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleEmailShare}
                className="flex flex-col h-auto py-6 gap-2 hover:bg-[#ea00ea]/5 hover:border-[#ea00ea]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea00ea]/10 to-[#8b00ff]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#ea00ea]" />
                </div>
                <span className="text-xs font-medium">Email</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSMSShare}
                className="flex flex-col h-auto py-6 gap-2 hover:bg-[#0080ff]/5 hover:border-[#0080ff]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0080ff]/10 to-[#00d4ff]/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#0080ff]" />
                </div>
                <span className="text-xs font-medium">SMS</span>
              </Button>
              {navigator.share && (
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  className="flex flex-col h-auto py-6 gap-2 hover:bg-[#8b00ff]/5 hover:border-[#8b00ff]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b00ff]/10 to-[#ea00ea]/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-[#8b00ff]" />
                  </div>
                  <span className="text-xs font-medium">More</span>
                </Button>
              )}
            </div>
          </div>

          {/* Platform List */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Connected Platforms</h3>
            <div className="space-y-2">
              {accounts.slice(0, 5).map((account) => (
                <div key={account.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium text-gray-700">{account.platform}</span>
                  <span className="text-gray-500">@{account.handle}</span>
                </div>
              ))}
              {accounts.length > 5 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{accounts.length - 5} more platforms
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}