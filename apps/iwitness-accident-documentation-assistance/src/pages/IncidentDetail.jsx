import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Calendar, MapPin, Car, Heart, Users, Camera,
  FileText, Download, Share2, HelpCircle, Clock, Shield,
  Lock, CheckCircle, AlertTriangle, ExternalLink, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { checkCoolingOffPeriod, canRequestHelp, createAuditLog, recordConsent, US_STATES } from '../components/core/jurisdictionGate';

export default function IncidentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [helpTypes, setHelpTypes] = useState([]);
  const [shareConsent, setShareConsent] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      const incidents = await base44.entities.Incident.filter({ id: incidentId });
      return incidents[0];
    },
    enabled: !!incidentId
  });

  const { data: evidenceFiles = [] } = useQuery({
    queryKey: ['evidence', incidentId],
    queryFn: () => base44.entities.EvidenceFile.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });

  const { data: jurisdictionRules = [] } = useQuery({
    queryKey: ['jurisdictionRules'],
    queryFn: () => base44.entities.JurisdictionRule.list()
  });

  const requestHelpMutation = useMutation({
    mutationFn: async () => {
      // Record consent
      await recordConsent({
        user_id: user.id,
        incident_id: incidentId,
        consent_type: 'share_with_professionals',
        accepted: true,
        consent_version: '1.0'
      });

      // Update incident
      await base44.entities.Incident.update(incidentId, {
        status: 'help_requested',
        help_requested_at: new Date().toISOString(),
        help_types_requested: helpTypes
      });

      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'user',
        action: 'request_help',
        entity_type: 'Incident',
        entity_id: incidentId,
        details: { help_types: helpTypes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['incident', incidentId]);
      setShowHelpDialog(false);
    }
  });

  if (isLoading || !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const gateStatus = checkCoolingOffPeriod(incident, jurisdictionRules);
  const helpStatus = canRequestHelp(incident, gateStatus);

  const getStateName = (code) => US_STATES.find(s => s.code === code)?.name || code;

  const Section = ({ icon: Icon, title, children, color = "slate" }) => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-50`}>
            <Icon className={`w-4 h-4 text-${color}-600`} />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl('Dashboard')}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Incident on {incident.occurred_at ? format(new Date(incident.occurred_at), 'MMMM d, yyyy') : 'N/A'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {incident.status?.replace('_', ' ').charAt(0).toUpperCase() + incident.status?.slice(1).replace('_', ' ')}
                </Badge>
                {incident.jurisdiction_state && (
                  <Badge variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    {getStateName(incident.jurisdiction_state)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Cooling-Off Status */}
        {incident.status !== 'draft' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-0 shadow-sm mb-6 ${
              gateStatus.passed 
                ? (incident.help_requested_at ? 'bg-purple-50' : 'bg-emerald-50')
                : 'bg-amber-50'
            }`}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      gateStatus.passed 
                        ? (incident.help_requested_at ? 'bg-purple-100' : 'bg-emerald-100')
                        : 'bg-amber-100'
                    }`}>
                      {gateStatus.passed ? (
                        incident.help_requested_at ? (
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Shield className="w-6 h-6 text-emerald-600" />
                        )
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      {incident.help_requested_at ? (
                        <>
                          <h3 className="font-semibold text-purple-900">Help Requested</h3>
                          <p className="text-sm text-purple-700">
                            You requested {incident.help_types_requested?.join(', ')} assistance on {format(new Date(incident.help_requested_at), 'MMM d, yyyy')}
                          </p>
                        </>
                      ) : gateStatus.passed ? (
                        <>
                          <h3 className="font-semibold text-emerald-900">Professional Help Available</h3>
                          <p className="text-sm text-emerald-700">
                            You can now connect with legal, medical, or repair professionals
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-amber-900">Cooling-Off Period</h3>
                          <p className="text-sm text-amber-700">
                            {gateStatus.daysRemaining} days remaining before professional help is available
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {gateStatus.passed && !incident.help_requested_at && (
                    <Button 
                      onClick={() => setShowHelpDialog(true)}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Request Help
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evidence">Evidence ({evidenceFiles.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Section icon={Calendar} title="Date & Time" color="blue">
                <div className="space-y-2 text-sm">
                  <p>{incident.occurred_at ? format(new Date(incident.occurred_at), 'MMMM d, yyyy') : 'Not specified'}</p>
                  <p className="text-slate-500">{incident.occurred_at ? format(new Date(incident.occurred_at), 'h:mm a') : ''}</p>
                </div>
              </Section>

              <Section icon={MapPin} title="Location" color="emerald">
                <div className="space-y-2 text-sm">
                  <p>{incident.location_text || 'Not specified'}</p>
                  <p className="text-slate-500">
                    {[getStateName(incident.jurisdiction_state), incident.jurisdiction_county].filter(Boolean).join(', ')}
                  </p>
                </div>
              </Section>

              <Section icon={Car} title="Vehicles" color="indigo">
                {incident.vehicles_involved?.length > 0 ? (
                  <div className="space-y-2">
                    {incident.vehicles_involved.map((v, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{v.is_own_vehicle ? 'Your Vehicle: ' : `Vehicle ${i + 1}: `}</span>
                        {[v.year, v.make, v.model, v.color].filter(Boolean).join(' ') || 'Details not provided'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No vehicles documented</p>
                )}
              </Section>

              <Section icon={Heart} title="Injuries" color="red">
                {incident.injuries?.length > 0 ? (
                  <div className="space-y-2">
                    {incident.injuries.map((inj, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {inj.severity}
                        </Badge>
                        <span className="text-sm">{inj.person}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No injuries reported</p>
                )}
              </Section>
            </div>

            {incident.narrative && (
              <Section icon={FileText} title="Your Statement" color="teal">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {incident.narrative}
                </p>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="evidence">
            {evidenceFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {evidenceFiles.map((file) => (
                  <Card key={file.id} className="border-0 shadow-sm overflow-hidden">
                    {file.file_type === 'photo' ? (
                      <img 
                        src={file.file_url} 
                        alt={file.filename}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <CardContent className="py-3">
                      <p className="text-xs font-medium text-slate-700 truncate">{file.filename}</p>
                      <p className="text-xs text-slate-500 capitalize">{file.file_type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No evidence files uploaded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-0 shadow-sm">
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Report Created</p>
                      <p className="text-xs text-slate-500">{format(new Date(incident.created_date), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                  {incident.wizard_completed && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Report Submitted</p>
                        <p className="text-xs text-slate-500">{format(new Date(incident.updated_date), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                    </div>
                  )}
                  {incident.help_requested_at && (
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Help Requested</p>
                        <p className="text-xs text-slate-500">{format(new Date(incident.help_requested_at), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Help Dialog */}
        <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Professional Help</DialogTitle>
              <DialogDescription>
                Select the type of assistance you need. Professionals will only see your information after you explicitly share it with them.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {[
                  { id: 'legal', label: 'Legal Assistance', desc: 'Connect with attorneys' },
                  { id: 'medical', label: 'Medical Care', desc: 'Find clinics and doctors' },
                  { id: 'vehicle_repair', label: 'Vehicle Repair', desc: 'Auto body shops' }
                ].map((type) => (
                  <div key={type.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Checkbox
                      id={type.id}
                      checked={helpTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setHelpTypes([...helpTypes, type.id]);
                        } else {
                          setHelpTypes(helpTypes.filter(t => t !== type.id));
                        }
                      }}
                    />
                    <div>
                      <Label htmlFor={type.id} className="font-medium cursor-pointer">{type.label}</Label>
                      <p className="text-xs text-slate-500">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Checkbox
                  id="share-consent"
                  checked={shareConsent}
                  onCheckedChange={setShareConsent}
                />
                <div>
                  <Label htmlFor="share-consent" className="font-medium cursor-pointer">
                    I consent to share my incident details
                  </Label>
                  <p className="text-xs text-blue-600 mt-1">
                    I understand that I will need to explicitly select providers to share my information with.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHelpDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => requestHelpMutation.mutate()}
                disabled={helpTypes.length === 0 || !shareConsent || requestHelpMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {requestHelpMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}