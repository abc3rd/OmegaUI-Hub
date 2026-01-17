import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronDown,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.user_role !== 'admin') {
        return;
      }

      const [allLeads, allCodes] = await Promise.all([
        base44.entities.Lead.list("-created_date", 100),
        base44.entities.ReferralCode.list("-total_referrals", 50)
      ]);

      setLeads(allLeads);
      setPartners(allCodes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await base44.entities.Lead.update(leadId, { status: newStatus });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success("Status updated");

      // If qualified/converted, update partner stats
      const lead = leads.find(l => l.id === leadId);
      if (lead?.referred_by && (newStatus === 'qualified' || newStatus === 'converted')) {
        const partnerCodes = partners.filter(p => p.affiliate_id === lead.referred_by);
        if (partnerCodes.length > 0) {
          await base44.entities.ReferralCode.update(partnerCodes[0].id, {
            qualified_referrals: (partnerCodes[0].qualified_referrals || 0) + 1
          });
        }
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const statusConfig = {
    new: { label: "New", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: Clock },
    contacted: { label: "Contacted", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: Phone },
    qualified: { label: "Qualified", color: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: TrendingUp },
    converted: { label: "Converted", color: "bg-green-500/10 text-green-400 border-green-500/30", icon: CheckCircle },
    closed: { label: "Closed", color: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: AlertCircle },
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (lead.phone_number || "").includes(searchTerm) ||
      (lead.referred_by?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ea00ea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.user_role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-800 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage leads and partners</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ea00ea]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#ea00ea]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400">Total Leads</p>
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
                  <p className="text-2xl font-bold text-white">{stats.new}</p>
                  <p className="text-xs text-slate-400">New Leads</p>
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
                  <p className="text-2xl font-bold text-white">{stats.qualified}</p>
                  <p className="text-xs text-slate-400">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4bce2a]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#4bce2a]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.converted}</p>
                  <p className="text-xs text-slate-400">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="leads" className="data-[state=active]:bg-[#ea00ea]/20 data-[state=active]:text-[#ea00ea]">
              <FileText className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:bg-[#ea00ea]/20 data-[state=active]:text-[#ea00ea]">
              <QrCode className="w-4 h-4 mr-2" />
              Partners
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <CardTitle className="text-white">All Leads</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-800 border-slate-700 text-white w-48"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-sm">
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Phone</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Referrer</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => {
                        const status = statusConfig[lead.status] || statusConfig.new;
                        return (
                          <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="p-4">
                              <p className="text-white font-medium">{lead.full_name || "Anonymous"}</p>
                              {lead.is_guest && (
                                <Badge variant="outline" className="text-xs mt-1 border-slate-600 text-slate-400">
                                  Guest
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <a href={`tel:${lead.phone_number}`} className="text-[#2699fe] hover:underline">
                                {lead.phone_number}
                              </a>
                            </td>
                            <td className="p-4">
                              {lead.incident_type ? (
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                                  {lead.incident_type}
                                </Badge>
                              ) : (
                                <span className="text-slate-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {lead.referred_by ? (
                                <Badge variant="outline" className="font-mono border-[#4bce2a]/30 text-[#4bce2a]">
                                  {lead.referred_by}
                                </Badge>
                              ) : (
                                <span className="text-slate-500">Direct</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                              {format(new Date(lead.created_date), "MMM d, h:mm a")}
                            </td>
                            <td className="p-4">
                              <Select
                                value={lead.status}
                                onValueChange={(value) => updateLeadStatus(lead.id, value)}
                              >
                                <SelectTrigger className={`w-32 ${status.color} border`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="qualified">Qualified</SelectItem>
                                  <SelectItem value="converted">Converted</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedLead(lead)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-white">All Partners</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {partners.map((partner) => (
                    <div key={partner.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                          <span className="text-white font-bold">
                            {partner.affiliate_id?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-mono font-bold">{partner.affiliate_id}</p>
                          <p className="text-slate-500 text-sm">{partner.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-white">{partner.total_referrals || 0}</p>
                          <p className="text-xs text-slate-500">Referrals</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#4bce2a]">{partner.qualified_referrals || 0}</p>
                          <p className="text-xs text-slate-500">Qualified</p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={partner.is_active 
                            ? "bg-[#4bce2a]/10 text-[#4bce2a] border-[#4bce2a]/30"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }
                        >
                          {partner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm">Name</p>
                  <p className="text-white font-medium">{selectedLead.full_name || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Phone</p>
                  <a href={`tel:${selectedLead.phone_number}`} className="text-[#2699fe] hover:underline">
                    {selectedLead.phone_number}
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Email</p>
                  <p className="text-white">{selectedLead.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Incident Type</p>
                  <p className="text-white">{selectedLead.incident_type || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">At Fault</p>
                  <p className="text-white">{selectedLead.at_fault || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Referred By</p>
                  <p className="text-white font-mono">{selectedLead.referred_by || "Direct"}</p>
                </div>
              </div>

              {selectedLead.injuries && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Injuries</p>
                  <p className="text-white">{selectedLead.injuries}</p>
                </div>
              )}

              {selectedLead.medical_treatment && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Medical Treatment</p>
                  <p className="text-white">{selectedLead.medical_treatment}</p>
                </div>
              )}

              {selectedLead.location_address && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#ea00ea] mt-1" />
                    <p className="text-white">{selectedLead.location_address}</p>
                  </div>
                  {selectedLead.latitude && selectedLead.longitude && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selectedLead.latitude}&mlon=${selectedLead.longitude}#map=18/${selectedLead.latitude}/${selectedLead.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2699fe] text-sm hover:underline flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Map
                    </a>
                  )}
                </div>
              )}

              {selectedLead.description && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Description</p>
                  <p className="text-white">{selectedLead.description}</p>
                </div>
              )}

              {selectedLead.photo_evidence?.length > 0 && (
                <div>
                  <p className="text-slate-500 text-sm mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedLead.photo_evidence.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" className="rounded-lg w-full aspect-square object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-sm">
                  Submitted {format(new Date(selectedLead.created_date), "MMMM d, yyyy 'at' h:mm a")}
                </p>
                <Select
                  value={selectedLead.status}
                  onValueChange={(value) => {
                    updateLeadStatus(selectedLead.id, value);
                    setSelectedLead({ ...selectedLead, status: value });
                  }}
                >
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}