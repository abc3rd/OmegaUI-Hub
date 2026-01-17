import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Shield, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function ConnectionStats({ totalConnections, recentConnection }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid md:grid-cols-4 gap-4"
    >
      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Circle</p>
              <p className="text-2xl font-bold text-[#0A1628]">{totalConnections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Verified</p>
              <p className="text-2xl font-bold text-[#0A1628]">{totalConnections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Growth</p>
              <p className="text-2xl font-bold text-[#0A1628]">+{Math.min(totalConnections, 5)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Recent</p>
              <p className="text-lg font-bold text-[#0A1628]">
                {recentConnection || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}