import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  ChevronRight,
  QrCode,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Get user's own reports
      const userLeads = await base44.entities.Lead.filter({ 
        created_by: userData.email 
      }, "-created_date");
      setLeads(userLeads);

      // Get user's referral code if they're a partner
      if (userData.affiliate_id) {
        const codes = await base44.entities.ReferralCode.filter({ 
          affiliate_id: userData.affiliate_id 
        });
        if (codes.length > 0) setReferralCode(codes[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const statusConfig = {
    new: { label: "New", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: Clock },
    contacted: { label: "Contacted", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: Phone },
    qualified: { label: "Qualified", color: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: TrendingUp },
    converted: { label: "Converted", color: "bg-green-500/10 text-green-400 border-green-500/30", icon: CheckCircle },
    closed: { label: "Closed", color: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: AlertCircle },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ea00ea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPartner = user?.user_role === 'partner' || user?.user_role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-400">Track your reports and referrals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ea00ea]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#ea00ea]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{leads.length}</p>
                  <p className="text-xs text-slate-400">My Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2699fe]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#2699fe]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {leads.filter(l => l.status === 'new').length}
                  </p>
                  <p className="text-xs text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isPartner && (
            <>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4bce2a]/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-[#4bce2a]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {referralCode?.total_referrals || 0}
                      </p>
                      <p className="text-xs text-slate-400">Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {referralCode?.qualified_referrals || 0}
                      </p>
                      <p className="text-xs text-slate-400">Qualified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Partner CTA */}
        {!isPartner && (
          <Card className="bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 border-[#ea00ea]/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Become a Partner</h3>
                    <p className="text-slate-400 text-sm">Earn rewards for every referral you send</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white hover:opacity-90">
                  Learn More
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Reports */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#ea00ea]" />
              My Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-4">No reports yet</p>
                <Link to={createPageUrl("Report")}>
                  <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white">
                    Report an Accident
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {leads.map((lead) => {
                  const status = statusConfig[lead.status] || statusConfig.new;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={lead.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            {lead.incident_type && (
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                                {lead.incident_type}
                              </Badge>
                            )}
                            {lead.at_fault && (
                              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                                {lead.at_fault}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {format(new Date(lead.created_date), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          
                          {lead.description && (
                            <p className="text-white text-sm mb-2 line-clamp-2">
                              {lead.description}
                            </p>
                          )}
                          
                          {lead.location_address && (
                            <div className="flex items-center gap-2">
                              <p className="text-slate-500 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {lead.location_address}
                              </p>
                              {lead.latitude && lead.longitude && (
                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${lead.latitude}&mlon=${lead.longitude}#map=18/${lead.latitude}/${lead.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#2699fe] text-xs hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Open Map
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {lead.photo_evidence?.length > 0 && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            <img 
                              src={lead.photo_evidence[0]} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}