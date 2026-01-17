import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  QrCode as QrIcon,
  Link as LinkIcon,
  Cloud,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

function MetricCard({ title, value, change, icon: Icon, color }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{title}</p>
              <p className="text-3xl font-bold text-white mt-2">{value}</p>
              <p className="text-slate-500 text-xs mt-2">{change}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: qrCodes } = useQuery({
    queryKey: ['qrCodes'],
    queryFn: () => base44.entities.QrCode.list('-created_date', 10),
    initialData: []
  });

  const { data: configs } = useQuery({
    queryKey: ['ghlConfig'],
    queryFn: () => base44.entities.GhlConfig.list(),
    initialData: []
  });

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0);
  const isConfigured = configs && configs.length > 0 && configs[0].base_intake_url;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#f8d417] via-[#4acbbf] to-[#54b0e7] bg-clip-text text-transparent">
                SynCloud Connect
              </h1>
              <p className="text-slate-400">QR code generation and affiliate tracking powered by GHL</p>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl("QrGenerator")}>
                <Button className="bg-gradient-to-r from-[#54b0e7] to-[#4acbbf] hover:opacity-90 shadow-lg">
                  <QrIcon className="w-4 h-4 mr-2" />
                  Generate QR
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Configuration Status */}
          {!isConfigured && (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-[#f66c25]/20 to-[#f8d417]/20 border-[#f66c25]/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-6 h-6 text-[#f66c25]" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Configuration Required</h3>
                      <p className="text-slate-300 text-sm">Please configure your GHL settings to start generating QR codes</p>
                    </div>
                    <Link to={createPageUrl("Settings")}>
                      <Button variant="outline" className="border-[#f8d417] text-[#f8d417] hover:bg-[#f8d417]/10">
                        Configure Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total QR Codes"
              value={qrCodes.length}
              change="Active"
              icon={QrIcon}
              color="from-[#54b0e7] to-[#4acbbf]"
            />
            <MetricCard
              title="Total Scans"
              value={totalScans}
              change="All time"
              icon={Target}
              color="from-[#4acbbf] to-[#f8d417]"
            />
            <MetricCard
              title="GHL Status"
              value={isConfigured ? "Connected" : "Not Setup"}
              change={isConfigured ? "Active" : "Pending"}
              icon={Cloud}
              color="from-[#f8d417] to-[#f66c25]"
            />
            <MetricCard
              title="Affiliates"
              value={qrCodes.length}
              change="Tracked"
              icon={Users}
              color="from-[#f66c25] to-[#54b0e7]"
            />
          </div>

          {/* Recent QR Codes */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <QrIcon className="w-5 h-5 text-[#4acbbf]" />
                  Recent QR Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {qrCodes.length > 0 ? (
                  <div className="space-y-3">
                    {qrCodes.slice(0, 5).map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg p-1">
                            <img src={qr.qr_code_url} alt="QR" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{qr.affiliate_id}</p>
                            <p className="text-xs text-slate-400">
                              {qr.first_name} {qr.last_name} • {qr.scan_count || 0} scans
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(qr.qr_code_url, '_blank')}
                          className="text-[#54b0e7] hover:text-[#4acbbf]"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <QrIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No QR codes generated yet</p>
                    <Link to={createPageUrl("QrGenerator")}>
                      <Button variant="outline" className="mt-4 border-[#54b0e7] text-[#54b0e7]">
                        Generate Your First QR
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}