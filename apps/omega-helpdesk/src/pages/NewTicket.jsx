import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

export default function NewTicket() {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    status: 'new',
    channel: 'web_form',
    category: '',
  });

  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contact_type: 'client'
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', currentTenant?.id],
    queryFn: () => base44.entities.Contact.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  const filteredContacts = contacts.filter(c =>
    c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSelectedContact(contact);
      setShowNewContact(false);
      setNewContact({ first_name: '', last_name: '', email: '', phone: '', contact_type: 'client' });
      toast.success('Contact created successfully');
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data) => {
      // Generate ticket number
      const prefix = currentTenant.slug?.substring(0, 3).toUpperCase() || 'TKT';
      const random = Math.floor(Math.random() * 10000);
      const ticket_number = `${prefix}-${random}`;

      const ticket = await base44.entities.Ticket.create({
        ...data,
        ticket_number,
        tenant_id: currentTenant.id,
      });

      // Create initial message
      await base44.entities.TicketMessage.create({
        tenant_id: currentTenant.id,
        ticket_id: ticket.id,
        author_type: 'contact',
        author_id: data.contact_id,
        author_name: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name}` : 'Contact',
        message_body: data.description,
        is_internal: false,
        sent_via: data.channel
      });

      return ticket;
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
      navigate(createPageUrl('TicketDetail') + `?id=${ticket.id}`);
    },
  });

  const handleCreateContact = () => {
    if (!newContact.email || !newContact.first_name) {
      toast.error('Email and first name are required');
      return;
    }
    createContactMutation.mutate({
      ...newContact,
      tenant_id: currentTenant.id
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedContact) {
      toast.error('Please select or create a contact');
      return;
    }

    if (!ticketData.subject || !ticketData.description) {
      toast.error('Subject and description are required');
      return;
    }

    createTicketMutation.mutate({
      ...ticketData,
      contact_id: selectedContact.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to={createPageUrl('Tickets')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create New Ticket</h1>
        <p className="text-slate-600 mt-1">Submit a new support ticket</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedContact ? (
              <>
                <div>
                  <Label>Search Existing Contact</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="mb-2"
                  />
                  {contactSearch && filteredContacts.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {filteredContacts.slice(0, 5).map(contact => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => setSelectedContact(contact)}
                          className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-slate-600">{contact.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!showNewContact ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewContact(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Contact
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCreateContact}
                        disabled={createContactMutation.isPending}
                        className="tenant-primary"
                      >
                        Create Contact
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewContact(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-green-900">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </p>
                    <p className="text-sm text-green-700">{selectedContact.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContact(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Brief description of the issue"
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={ticketData.description}
                onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={ticketData.priority}
                  onValueChange={(value) => setTicketData({ ...ticketData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Channel</Label>
                <Select
                  value={ticketData.channel}
                  onValueChange={(value) => setTicketData({ ...ticketData, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web_form">Web Form</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  placeholder="e.g., Technical Support"
                  value={ticketData.category}
                  onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to={createPageUrl('Tickets')}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createTicketMutation.isPending || !selectedContact}
            className="tenant-primary"
          >
            Create Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}