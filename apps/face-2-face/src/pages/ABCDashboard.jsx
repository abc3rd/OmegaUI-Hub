import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ABCDashboard() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white">ABC Dashboard</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Analytics, Business intelligence & Control. Coming soon to Omega UI.
          </p>
        </motion.div>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-500/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Under Development</h2>
            <p className="text-slate-400 mb-6">
              ABC Dashboard will provide comprehensive analytics and business intelligence for all your Omega platforms.
            </p>
            <Button variant="outline" className="border-green-500/30 text-green-400">
              Request Early Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}