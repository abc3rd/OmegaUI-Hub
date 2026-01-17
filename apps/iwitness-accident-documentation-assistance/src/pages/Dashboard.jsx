import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Clock, CheckCircle, AlertCircle, 
  ArrowRight, Calendar, MapPin, Shield, HelpCircle,
  Car, ChevronRight, Folder
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { checkCoolingOffPeriod } from '../components/core/jurisdictionGate';
import { US_STATES } from '../components/core/jurisdictionGate';

const STATUS_CONFIG = {
  draft: { 
    label: 'Draft', 
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText
  },
  submitted: { 
    label: 'Submitted', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle
  },
  under_review: { 
    label: 'Under Review', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock
  },
  help_requested: { 
    label: 'Help Requested', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: HelpCircle
  },
  resolved: { 
    label: 'Resolved', 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle
  },
  archived: { 
    label: 'Archived', 
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Folder
  }
};

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Incident.filter({ user_id: user.id }, '-created_date');
    },
    enabled: !!user?.id
  });

  const { data: jurisdictionRules = [] } = useQuery({
    queryKey: ['jurisdictionRules'],
    queryFn: () => base44.entities.JurisdictionRule.list()
  });

  const getStateName = (code) => {
    return US_STATES.find(s => s.code === code)?.name || code;
  };

  const stats = {
    total: incidents.length,
    drafts: incidents.filter(i => i.status === 'draft').length,
    active: incidents.filter(i => ['submitted', 'under_review', 'help_requested'].includes(i.status)).length,
    resolved: incidents.filter(i => i.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Incidents</h1>
            <p className="text-slate-500 mt-1">
              Document and manage your accident reports
            </p>
          </div>
          <Button asChild className="bg-[#ea00ea] hover:bg-[#d100d1] gap-2">
            <Link to={createPageUrl('IncidentWizard')}>
              <Plus className="w-4 h-4" />
              New Incident
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reports', value: stats.total, icon: FileText, color: 'slate' },
            { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'amber' },
            { label: 'Active', value: stats.active, icon: AlertCircle, color: 'blue' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'emerald' }
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm mb-8 bg-gradient-to-r from-[#ea00ea] to-purple-700 text-white overflow-hidden">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Document Everything</h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    The more details you capture, the stronger your documentation
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Protected by patent pending technology
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" className="gap-2 bg-white text-slate-900 hover:bg-slate-100">
                <Link to={createPageUrl('IncidentWizard')}>
                  Start New Report
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Reports</h2>
          
          {isLoading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">Loading...</p>
              </CardContent>
            </Card>
          ) : incidents.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="p-4 rounded-full bg-slate-100 inline-flex mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-700 mb-2">No incidents yet</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Start documenting an incident to keep track of everything.
                </p>
                <Button asChild className="gap-2">
                  <Link to={createPageUrl('IncidentWizard')}>
                    <Plus className="w-4 h-4" />
                    Create First Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            incidents.map((incident, index) => {
              const StatusIcon = STATUS_CONFIG[incident.status]?.icon || FileText;
              const gateStatus = checkCoolingOffPeriod(incident, jurisdictionRules);
              
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={incident.status === 'draft' 
                    ? createPageUrl('IncidentWizard') + `?id=${incident.id}`
                    : createPageUrl('IncidentDetail') + `?id=${incident.id}`
                  }>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
                            <Car className="w-5 h-5 text-slate-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-medium text-slate-900 group-hover:text-slate-700">
                                  {incident.occurred_at 
                                    ? `Incident on ${format(new Date(incident.occurred_at), 'MMM d, yyyy')}`
                                    : 'Incident Report'
                                  }
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={STATUS_CONFIG[incident.status]?.color}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {STATUS_CONFIG[incident.status]?.label}
                                  </Badge>
                                  
                                  {incident.jurisdiction_state && (
                                    <Badge variant="outline" className="text-xs">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {getStateName(incident.jurisdiction_state)}
                                    </Badge>
                                  )}
                                  
                                  {incident.vehicles_involved?.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {incident.vehicles_involved.length} vehicle(s)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {incident.status === 'submitted' && !gateStatus.passed && (
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500">Help available in</p>
                                    <p className="text-sm font-medium text-amber-600">
                                      {gateStatus.daysRemaining} days
                                    </p>
                                  </div>
                                )}
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                              </div>
                            </div>
                            
                            {incident.location_text && (
                              <p className="text-sm text-slate-500 mt-2 truncate">
                                {incident.location_text}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}