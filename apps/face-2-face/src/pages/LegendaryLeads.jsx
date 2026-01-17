import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LegendaryLeads() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white">Legendary Leads</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            AI-powered lead generation & management. Coming soon to Omega UI.
          </p>
        </motion.div>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-amber-500/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Under Development</h2>
            <p className="text-slate-400 mb-6">
              Legendary Leads will use AI to find, qualify, and manage leads automatically.
            </p>
            <Button variant="outline" className="border-amber-500/30 text-amber-400">
              Join Waitlist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}