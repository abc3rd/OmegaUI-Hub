import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Mail, Phone, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Contacts() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contact_type: 'client',
    company: ''
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', currentTenant?.id],
    queryFn: () => base44.entities.Contact.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create({ ...data, tenant_id: currentTenant.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDialogOpen(false);
      setNewContact({ first_name: '', last_name: '', email: '', phone: '', contact_type: 'client', company: '' });
      toast.success('Contact created successfully');
    },
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!newContact.email || !newContact.first_name) {
      toast.error('Email and first name are required');
      return;
    }
    createContactMutation.mutate(newContact);
  };

  const typeColors = {
    client: 'bg-blue-100 text-blue-700',
    attorney: 'bg-purple-100 text-purple-700',
    partner: 'bg-green-100 text-green-700',
    referral_source: 'bg-orange-100 text-orange-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="tenant-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Type</Label>
                <Select
                  value={newContact.contact_type}
                  onValueChange={(value) => setNewContact({ ...newContact, contact_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="attorney">Attorney</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="referral_source">Referral Source</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContactMutation.isPending} className="tenant-primary">
                  Create Contact
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Contact Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="attorney">Attorney</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="referral_source">Referral Source</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading contacts...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No contacts found</h3>
          <p className="text-slate-600">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first contact to get started'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full tenant-primary text-white flex items-center justify-center text-lg font-semibold">
                      {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {contact.first_name} {contact.last_name}
                      </CardTitle>
                      <Badge className={`${typeColors[contact.contact_type]} mt-1`}>
                        {contact.contact_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${contact.email}`} className="tenant-text-accent hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${contact.phone}`} className="text-slate-700">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{contact.company}</span>
                  </div>
                )}
                <div className="pt-2 text-xs text-slate-500">
                  Added {new Date(contact.created_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}