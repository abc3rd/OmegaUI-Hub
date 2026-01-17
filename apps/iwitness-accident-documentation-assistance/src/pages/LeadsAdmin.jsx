import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Users, Search, Download, Filter, TrendingUp, 
  UserCheck, XCircle, CheckCircle, Clock, Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-purple-100 text-purple-700', icon: Users },
  qualified: { label: 'Qualified', color: 'bg-amber-100 text-amber-700', icon: TrendingUp },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
};

export default function LeadsAdmin() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  // Check admin access
  const isAdmin = user?.role === 'admin' || user?.user_role === 'admin';
  const isStaff = isAdmin || user?.role === 'staff' || user?.user_role === 'staff';

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_at_utc'),
    enabled: isStaff
  });

  const { data: leadEvents = [] } = useQuery({
    queryKey: ['leadEvents'],
    queryFn: () => base44.entities.LeadEvent.list('-timestamp_utc', 100),
    enabled: isStaff
  });

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lead_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Get unique sources
  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Lead ID', 'Created At', 'Status', 'Referral Code', 'Source', 
      'Campaign', 'UTM Source', 'UTM Medium', 'Session ID', 'User ID', 
      'First Touch URL', 'Last Touch URL'
    ];
    
    const rows = filteredLeads.map(lead => [
      lead.lead_id,
      format(new Date(lead.created_at_utc), 'yyyy-MM-dd HH:mm:ss'),
      lead.status,
      lead.referral_code || '',
      lead.source || '',
      lead.campaign || '',
      lead.utm_source || '',
      lead.utm_medium || '',
      lead.session_id || '',
      lead.user_id || '',
      lead.first_touch_url || '',
      lead.last_touch_url || ''
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">This page is only accessible to staff and administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Lead Tracking</h1>
          <p className="text-slate-500">Monitor and manage lead attribution and conversions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: stats.total, icon: Users, color: 'blue' },
            { label: 'New', value: stats.new, icon: Clock, color: 'purple' },
            { label: 'Qualified', value: stats.qualified, icon: TrendingUp, color: 'amber' },
            { label: 'Converted', value: stats.converted, icon: CheckCircle, color: 'emerald' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Referral</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">UTM</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, index) => {
                      const StatusIcon = STATUS_CONFIG[lead.status]?.icon || Clock;
                      return (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <div className="text-sm text-slate-900">
                              {format(new Date(lead.created_at_utc), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(lead.created_at_utc), 'h:mm a')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={STATUS_CONFIG[lead.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[lead.status]?.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-slate-900">
                              {lead.referral_code || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-700">{lead.source || '—'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs text-slate-600">
                              {lead.utm_source && <div>Source: {lead.utm_source}</div>}
                              {lead.utm_medium && <div>Medium: {lead.utm_medium}</div>}
                              {lead.utm_campaign && <div>Campaign: {lead.utm_campaign}</div>}
                              {!lead.utm_source && !lead.utm_medium && !lead.utm_campaign && '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {lead.session_id && (
                                <Badge variant="outline" className="text-xs">
                                  <LinkIcon className="w-3 h-3 mr-1" />
                                  Session
                                </Badge>
                              )}
                              {lead.user_id && (
                                <Badge variant="outline" className="text-xs">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  User
                                </Badge>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}