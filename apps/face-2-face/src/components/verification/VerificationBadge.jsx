import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationBadge({ level = "bronze", size = "md" }) {
  const levels = {
    bronze: {
      color: "bg-gradient-to-r from-amber-600 to-amber-700",
      border: "border-amber-400",
      text: "Face to Face Verified"
    },
    silver: {
      color: "bg-gradient-to-r from-slate-400 to-slate-500",
      border: "border-slate-300",
      text: "F2F Verified - Silver"
    },
    gold: {
      color: "bg-gradient-to-r from-[#D4AF37] to-[#b8941f]",
      border: "border-[#D4AF37]",
      text: "F2F Verified - Gold"
    }
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  const config = levels[level];

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="inline-flex"
    >
      <Badge 
        className={`${config.color} ${sizes[size]} text-white border-2 ${config.border} shadow-lg flex items-center gap-1.5 font-bold`}
      >
        <Shield className="w-3 h-3" />
        <span>{config.text}</span>
        <Check className="w-3 h-3" />
      </Badge>
    </motion.div>
  );
}