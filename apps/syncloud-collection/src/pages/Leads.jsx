import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Building,
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';
import { Lead } from '@/entities/Lead';
import { Contact } from '@/entities/Contact';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};

const statusIcons = {
  new: Users,
  contacted: Mail,
  qualified: UserCheck,
  lost: UserX
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLead, setNewLead] = useState({
    full_name: '',
    email: '',
    company: '',
    status: 'new',
    source: '',
    value: 0
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await Lead.list('-created_date');
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    try {
      await Lead.create(newLead);
      setNewLead({
        full_name: '',
        email: '',
        company: '',
        status: 'new',
        source: '',
        value: 0
      });
      setShowAddDialog(false);
      loadLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await Lead.update(leadId, { status: newStatus });
      loadLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const convertToContact = async (lead) => {
    try {
      await Contact.create({
        full_name: lead.full_name,
        email: lead.email,
        company: lead.company,
        notes: `Converted from lead. Source: ${lead.source}, Value: $${lead.value}`
      });
      await updateLeadStatus(lead.id, 'qualified');
      alert('Lead successfully converted to contact!');
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    totalValue: leads.reduce((sum, l) => sum + (l.value || 0), 0)
  };

  if (loading) {
    return <div className="p-6 text-center">Loading leads...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lead Tracker</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={newLead.full_name}
                  onChange={(e) => setNewLead({...newLead, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <Label>Source</Label>
                <Input
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  placeholder="Website, LinkedIn, Referral..."
                />
              </div>
              <div>
                <Label>Estimated Value ($)</Label>
                <Input
                  type="number"
                  value={newLead.value}
                  onChange={(e) => setNewLead({...newLead, value: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddLead}
                  disabled={!newLead.full_name || !newLead.email}
                >
                  Add Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p className="text-gray-500 mb-4">
                {leads.length === 0 ? "Start by adding your first lead" : "Try adjusting your search filters"}
              </p>
              {leads.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => {
                const StatusIcon = statusIcons[lead.status];
                return (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{lead.full_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          {lead.company && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {lead.company}
                            </span>
                          )}
                          {lead.value > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${lead.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {lead.source && (
                          <div className="text-xs text-gray-400 mt-1">Source: {lead.source}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[lead.status]}>
                        {lead.status}
                      </Badge>
                      
                      <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button size="sm" variant="outline" onClick={() => convertToContact(lead)}>
                        <UserCheck className="w-4 h-4 mr-1" />
                        Convert
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}