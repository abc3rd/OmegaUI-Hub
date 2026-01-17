import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, Users, FileText, Settings, Clock, Search,
  AlertTriangle, CheckCircle, Eye, Edit, Save, X, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { createAuditLog, US_STATES } from '../components/core/jurisdictionGate';

export default function AdminConsole() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [auditFilters, setAuditFilters] = useState({ action: 'all', entity_type: 'all' });
  
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

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ['admin-incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 100),
    enabled: isStaff
  });

  const { data: jurisdictionRules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['jurisdictionRules'],
    queryFn: () => base44.entities.JurisdictionRule.list(),
    enabled: isStaff
  });

  const { data: auditLogs = [], isLoading: loadingAudit } = useQuery({
    queryKey: ['auditLogs', auditFilters],
    queryFn: async () => {
      let query = {};
      if (auditFilters.action !== 'all') query.action = auditFilters.action;
      if (auditFilters.entity_type !== 'all') query.entity_type = auditFilters.entity_type;
      return await base44.entities.AuditLog.filter(query, '-created_date', 100);
    },
    enabled: isAdmin
  });

  const updateRuleMutation = useMutation({
    mutationFn: async (ruleData) => {
      if (ruleData.id) {
        await base44.entities.JurisdictionRule.update(ruleData.id, ruleData);
      } else {
        await base44.entities.JurisdictionRule.create(ruleData);
      }
      
      await createAuditLog({
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'admin',
        action: ruleData.id ? 'update' : 'create',
        entity_type: 'JurisdictionRule',
        entity_id: ruleData.id || 'new',
        details: ruleData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jurisdictionRules']);
      setSelectedRule(null);
    }
  });

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredIncidents = incidents.filter(i => 
    i.location_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.jurisdiction_state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStateName = (code) => US_STATES.find(s => s.code === code)?.name || code;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-slate-900">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
            <p className="text-slate-500">
              {isAdmin ? 'Full administrative access' : 'Staff view - limited access'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Incidents', value: incidents.length, icon: FileText },
            { label: 'Pending Review', value: incidents.filter(i => i.status === 'submitted').length, icon: Clock },
            { label: 'Help Requested', value: incidents.filter(i => i.status === 'help_requested').length, icon: Users },
            { label: 'Jurisdiction Rules', value: jurisdictionRules.length, icon: Settings }
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
                    <stat.icon className="w-5 h-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            {isAdmin && <TabsTrigger value="rules">Jurisdiction Rules</TabsTrigger>}
            {isAdmin && <TabsTrigger value="audit">Audit Log</TabsTrigger>}
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Incidents</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vehicles</TableHead>
                        <TableHead>Injuries</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingIncidents ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                          </TableCell>
                        </TableRow>
                      ) : filteredIncidents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No incidents found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredIncidents.map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>
                              {incident.occurred_at 
                                ? format(new Date(incident.occurred_at), 'MMM d, yyyy')
                                : 'N/A'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {getStateName(incident.jurisdiction_state) || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                {incident.location_text}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                incident.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                                incident.status === 'help_requested' ? 'bg-purple-50 text-purple-700' :
                                incident.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                                'bg-slate-50 text-slate-700'
                              }>
                                {incident.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{incident.vehicles_involved?.length || 0}</TableCell>
                            <TableCell>{incident.injuries?.length || 0}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">
                  Export functionality is disabled for compliance. All views are logged.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jurisdiction Rules Tab */}
          {isAdmin && (
            <TabsContent value="rules">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Jurisdiction Rules</CardTitle>
                      <CardDescription>Configure cooling-off periods by state</CardDescription>
                    </div>
                    <Button onClick={() => setSelectedRule({})}>
                      Add Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>State</TableHead>
                          <TableHead>County</TableHead>
                          <TableHead>Waiting Period</TableHead>
                          <TableHead>Marketplace</TableHead>
                          <TableHead>Explicit Request</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingRules ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                            </TableCell>
                          </TableRow>
                        ) : jurisdictionRules.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                              No rules configured. Add a rule to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          jurisdictionRules.map((rule) => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{getStateName(rule.state)}</TableCell>
                              <TableCell>{rule.county || 'All counties'}</TableCell>
                              <TableCell>{rule.waiting_period_days} days</TableCell>
                              <TableCell>
                                {rule.allow_marketplace_after_wait ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-300" />
                                )}
                              </TableCell>
                              <TableCell>
                                {rule.require_explicit_request_help ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-300" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={rule.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50'}>
                                  {rule.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Audit Log Tab */}
          {isAdmin && (
            <TabsContent value="audit">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Audit Log</CardTitle>
                      <CardDescription>Complete activity history</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select 
                        value={auditFilters.action} 
                        onValueChange={(v) => setAuditFilters({ ...auditFilters, action: v })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="share_incident">Share</SelectItem>
                          <SelectItem value="export_attempt">Export</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={auditFilters.entity_type} 
                        onValueChange={(v) => setAuditFilters({ ...auditFilters, entity_type: v })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Entities</SelectItem>
                          <SelectItem value="Incident">Incident</SelectItem>
                          <SelectItem value="IncidentShare">Share</SelectItem>
                          <SelectItem value="JurisdictionRule">Rule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Actor</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Blocked</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingAudit ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                            </TableCell>
                          </TableRow>
                        ) : auditLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              No audit logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          auditLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-sm">
                                {format(new Date(log.created_date), 'MMM d, h:mm a')}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{log.actor_email || 'System'}</div>
                                <div className="text-xs text-slate-500 capitalize">{log.actor_role}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{log.action}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{log.entity_type}</span>
                              </TableCell>
                              <TableCell>
                                {log.blocked ? (
                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Blocked
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Edit Rule Dialog */}
        <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRule?.id ? 'Edit Rule' : 'Add Jurisdiction Rule'}</DialogTitle>
            </DialogHeader>
            
            {selectedRule && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={selectedRule.state || ''}
                    onValueChange={(v) => setSelectedRule({ ...selectedRule, state: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>County (optional)</Label>
                  <Input
                    value={selectedRule.county || ''}
                    onChange={(e) => setSelectedRule({ ...selectedRule, county: e.target.value })}
                    placeholder="Leave blank for all counties"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Waiting Period (days)</Label>
                  <Input
                    type="number"
                    value={selectedRule.waiting_period_days || 30}
                    onChange={(e) => setSelectedRule({ ...selectedRule, waiting_period_days: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Allow Marketplace After Wait</p>
                    <p className="text-xs text-slate-500">Enable professional matching</p>
                  </div>
                  <Switch
                    checked={selectedRule.allow_marketplace_after_wait !== false}
                    onCheckedChange={(v) => setSelectedRule({ ...selectedRule, allow_marketplace_after_wait: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Require Explicit Request</p>
                    <p className="text-xs text-slate-500">User must click "Request Help"</p>
                  </div>
                  <Switch
                    checked={selectedRule.require_explicit_request_help !== false}
                    onCheckedChange={(v) => setSelectedRule({ ...selectedRule, require_explicit_request_help: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-slate-500">Rule is currently in effect</p>
                  </div>
                  <Switch
                    checked={selectedRule.is_active !== false}
                    onCheckedChange={(v) => setSelectedRule({ ...selectedRule, is_active: v })}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRule(null)}>Cancel</Button>
              <Button 
                onClick={() => updateRuleMutation.mutate(selectedRule)}
                disabled={!selectedRule?.state || updateRuleMutation.isPending}
              >
                {updateRuleMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}