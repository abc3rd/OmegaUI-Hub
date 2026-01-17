import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, MapPin, Star, Shield, Scale, Stethoscope, 
  Wrench, CheckCircle, Lock, Share2, ExternalLink, Loader2, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { checkCoolingOffPeriod, createAuditLog, US_STATES } from '../components/core/jurisdictionGate';

const PROVIDER_ICONS = {
  attorney: Scale,
  medical_clinic: Stethoscope,
  vehicle_repair: Wrench,
  insurance_agent: Shield
};

const PROVIDER_COLORS = {
  attorney: 'indigo',
  medical_clinic: 'emerald',
  vehicle_repair: 'amber',
  insurance_agent: 'blue'
};

export default function Marketplace() {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('incident');
  
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [shareScope, setShareScope] = useState({
    include_evidence: false,
    include_narrative: true,
    include_witnesses: false,
    include_police_report: true,
    include_injuries: true
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: incident } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const incidents = await base44.entities.Incident.filter({ id: incidentId });
      return incidents[0];
    },
    enabled: !!incidentId
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_active: true })
  });

  const { data: jurisdictionRules = [] } = useQuery({
    queryKey: ['jurisdictionRules'],
    queryFn: () => base44.entities.JurisdictionRule.list()
  });

  const { data: existingShares = [] } = useQuery({
    queryKey: ['shares', incidentId],
    queryFn: () => base44.entities.IncidentShare.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const share = await base44.entities.IncidentShare.create({
        incident_id: incidentId,
        provider_id: selectedProvider.id,
        shared_by_user_id: user.id,
        shared_at: new Date().toISOString(),
        scope: shareScope,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'user',
        action: 'share_incident',
        entity_type: 'IncidentShare',
        entity_id: share.id,
        details: { provider_id: selectedProvider.id, scope: shareScope }
      });

      return share;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shares', incidentId]);
      setSelectedProvider(null);
    }
  });

  const gateStatus = incident ? checkCoolingOffPeriod(incident, jurisdictionRules) : null;
  const canShare = incident?.help_requested_at && gateStatus?.passed;

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || provider.role_type === filterType;
    const matchesState = filterState === 'all' || provider.jurisdictions?.includes(filterState);
    return matchesSearch && matchesType && matchesState;
  });

  const isShared = (providerId) => existingShares.some(s => s.provider_id === providerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {incidentId && (
            <Link 
              to={createPageUrl('IncidentDetail') + `?id=${incidentId}`}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Incident
            </Link>
          )}
          
          <h1 className="text-3xl font-bold text-slate-900">Professional Services</h1>
          <p className="text-slate-500 mt-1">
            Find trusted professionals to help with your case
          </p>
        </div>

        {/* Gate Warning */}
        {incidentId && !canShare && (
          <Card className="border-0 shadow-sm mb-6 bg-amber-50">
            <CardContent className="py-4 flex items-center gap-4">
              <Lock className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Sharing Not Available</p>
                <p className="text-sm text-amber-700">
                  {!incident?.help_requested_at 
                    ? "You must request help on your incident before sharing with professionals."
                    : `Waiting period: ${gateStatus?.daysRemaining} days remaining.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="attorney">Attorneys</SelectItem>
              <SelectItem value="medical_clinic">Medical Clinics</SelectItem>
              <SelectItem value="vehicle_repair">Vehicle Repair</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map(state => (
                <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provider Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No providers found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider, index) => {
              const Icon = PROVIDER_ICONS[provider.role_type] || Shield;
              const color = PROVIDER_COLORS[provider.role_type] || 'slate';
              const shared = isShared(provider.id);
              
              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        {provider.logo_url ? (
                          <img 
                            src={provider.logo_url} 
                            alt={provider.business_name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${color}-600`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{provider.business_name}</h3>
                          <p className="text-sm text-slate-500 capitalize">{provider.role_type?.replace('_', ' ')}</p>
                        </div>
                        {provider.verified && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {provider.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-sm text-slate-400">({provider.review_count} reviews)</span>
                        </div>
                      )}

                      {provider.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {provider.specialties.slice(0, 3).map((spec, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {provider.jurisdictions?.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                          <MapPin className="w-3 h-3" />
                          {provider.jurisdictions.slice(0, 3).join(', ')}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {shared ? (
                          <Button variant="outline" className="flex-1" disabled>
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                            Shared
                          </Button>
                        ) : canShare ? (
                          <Button 
                            onClick={() => setSelectedProvider(provider)}
                            className="flex-1 gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share Incident
                          </Button>
                        ) : (
                          <Button variant="outline" className="flex-1" disabled={!incidentId}>
                            <Lock className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Incident with {selectedProvider?.business_name}</DialogTitle>
              <DialogDescription>
                Choose what information to share. The provider will only see what you explicitly allow.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm font-medium text-slate-700">Information to share:</p>
              
              {[
                { id: 'include_narrative', label: 'Your statement', desc: 'Your written account of what happened' },
                { id: 'include_injuries', label: 'Injury information', desc: 'Details about injuries reported' },
                { id: 'include_police_report', label: 'Police report info', desc: 'Report number and department' },
                { id: 'include_evidence', label: 'Evidence files', desc: 'Photos, videos, and documents' },
                { id: 'include_witnesses', label: 'Witness information', desc: 'Names and contact details' }
              ].map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <Checkbox
                    id={item.id}
                    checked={shareScope[item.id]}
                    onCheckedChange={(checked) => setShareScope({ ...shareScope, [item.id]: checked })}
                  />
                  <div>
                    <Label htmlFor={item.id} className="font-medium cursor-pointer">{item.label}</Label>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => shareMutation.mutate()}
                disabled={shareMutation.isPending}
              >
                {shareMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Confirm Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}