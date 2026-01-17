import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Shield, Users, CreditCard, AlertCircle, Clock } from "lucide-react";

const badgeConfig = {
  identity_verified: {
    icon: Shield,
    label: "Identity Verified",
    description: "This person's identity has been verified by our team",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  story_verified: {
    icon: CheckCircle2,
    label: "Story Verified",
    description: "Their story has been reviewed and verified",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  community_vouched: {
    icon: Users,
    label: "Community Vouched",
    description: "Vouched for by community members or organizations",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  stripe_verified: {
    icon: CreditCard,
    label: "Payment Verified",
    description: "Stripe account identity verification completed",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200"
  }
};

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified Profile",
    color: "text-green-600"
  },
  pending: {
    icon: Clock,
    label: "Verification Pending",
    color: "text-amber-600"
  },
  unverified: {
    icon: AlertCircle,
    label: "Not Yet Verified",
    color: "text-slate-400"
  }
};

export default function VerificationBadges({ profile, showStatus = true, size = "default" }) {
  const badges = profile.verificationBadges || [];
  const status = profile.verificationStatus || "unverified";
  const StatusIcon = statusConfig[status]?.icon || AlertCircle;

  const sizeClasses = {
    small: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-1",
    large: "text-base px-3 py-1.5"
  };

  if (badges.length === 0 && !showStatus) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {/* Main verification status */}
        {showStatus && status === "verified" && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Verified</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This profile has been verified by Cloud QR</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Individual badges */}
        {badges.map((badgeType) => {
          const config = badgeConfig[badgeType];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <Tooltip key={badgeType}>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`${config.color} ${sizeClasses[size]} flex items-center gap-1.5 cursor-help`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{config.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Pending status indicator */}
        {showStatus && status === "pending" && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Verification Pending
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Verification request is being reviewed</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}