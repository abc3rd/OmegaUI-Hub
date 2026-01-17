import React from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-[#EA00EA] to-[#9D00FF] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.full_name}</h3>
            <p className="text-sm text-white/80">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Role</span>
            <span className="font-semibold capitalize">{user.role}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => base44.auth.logout()}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}