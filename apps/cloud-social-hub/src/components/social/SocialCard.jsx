import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Image as ImageIcon,
  Share2,
  Trash2,
  Edit,
  ExternalLink,
  Users,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const platformConfig = {
  instagram: {
    icon: Instagram,
    gradient: "from-purple-600 via-pink-600 to-orange-500",
    color: "#E4405F",
  },
  facebook: {
    icon: Facebook,
    gradient: "from-blue-600 to-blue-500",
    color: "#1877F2",
  },
  twitter: {
    icon: Twitter,
    gradient: "from-sky-500 to-blue-500",
    color: "#1DA1F2",
  },
  linkedin: {
    icon: Linkedin,
    gradient: "from-blue-700 to-blue-600",
    color: "#0A66C2",
  },
  tiktok: {
    icon: MessageCircle,
    gradient: "from-black via-pink-500 to-cyan-500",
    color: "#000000",
  },
  youtube: {
    icon: Youtube,
    gradient: "from-red-600 to-red-500",
    color: "#FF0000",
  },
  snapchat: {
    icon: MessageCircle,
    gradient: "from-yellow-400 to-yellow-300",
    color: "#FFFC00",
  },
  pinterest: {
    icon: ImageIcon,
    gradient: "from-red-700 to-red-600",
    color: "#E60023",
  },
  whatsapp: {
    icon: MessageCircle,
    gradient: "from-green-500 to-green-400",
    color: "#25D366",
  },
};

export default function SocialCard({ account, isDragging }) {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const config = platformConfig[account.platform];
  const Icon = config?.icon || Share2;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleVisit = () => {
    window.open(account.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Follow us on ${account.platform}`,
          text: `Check out our ${account.platform} profile @${account.handle}`,
          url: account.url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(account.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      className={`group relative h-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isDragging ? 'scale-105 shadow-2xl rotate-3' : 'hover:scale-[1.02] hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-90`} />
      
      {/* Animated Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 blur-xl transition-opacity duration-500 ${
          isHovered ? 'opacity-30' : ''
        }`}
      />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg capitalize">{account.platform}</h3>
              <p className="text-sm opacity-90">@{account.handle}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleVisit}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate(account.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Section */}
        {account.follower_count && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 opacity-80" />
              <span className="text-2xl font-bold">{formatNumber(account.follower_count)}</span>
            </div>
            <p className="text-sm opacity-80">Followers</p>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={`flex gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Button
            onClick={handleVisit}
            size="sm"
            className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit
          </Button>
          <Button
            onClick={handleShare}
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#ea00ea] to-[#8b00ff] hover:from-[#d000d0] hover:to-[#7a00e6] text-white font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
    </div>
  );
}