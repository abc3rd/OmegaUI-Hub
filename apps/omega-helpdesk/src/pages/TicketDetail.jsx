import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  MessageSquare,
  Lock,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Tag,
  ArrowLeft,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ReactMarkdown from 'react-markdown';
import RemoteSupport from '../components/RemoteSupport';

export default function TicketDetail() {
  const { currentTenant, currentUser, hasPermission } = useTenant();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');

  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const tickets = await base44.entities.Ticket.filter({ id: ticketId });
      return tickets[0];
    },
    enabled: !!ticketId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', ticketId],
    queryFn: () => base44.entities.TicketMessage.filter({ ticket_id: ticketId }, '-created_date'),
    enabled: !!ticketId,
  });

  const { data: contact } = useQuery({
    queryKey: ['contact', ticket?.contact_id],
    queryFn: async () => {
      const contacts = await base44.entities.Contact.filter({ id: ticket.contact_id });
      return contacts[0];
    },
    enabled: !!ticket?.contact_id,
  });

  const addMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.TicketMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', ticketId] });
      setNewMessage('');
      setIsInternal(false);
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setIsEditing(false);
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      tenant_id: currentTenant.id,
      ticket_id: ticketId,
      author_type: 'user',
      author_id: currentUser.email,
      author_name: currentUser.full_name,
      message_body: newMessage,
      is_internal: isInternal,
      sent_via: 'web'
    };

    addMessageMutation.mutate(messageData);

    // Update first_response_at if this is the first response
    if (!ticket.first_response_at && !isInternal) {
      updateTicketMutation.mutate({
        id: ticketId,
        data: { first_response_at: new Date().toISOString() }
      });
    }
  };

  const handleUpdateTicket = () => {
    updateTicketMutation.mutate({
      id: ticketId,
      data: editedTicket
    });
  };

  const handleStartEdit = () => {
    setEditedTicket({ ...ticket });
    setIsEditing(true);
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    new: 'bg-purple-100 text-purple-700',
    open: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    on_hold: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700'
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={createPageUrl('Tickets')}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
        {!isEditing && hasPermission('manage_tickets') && (
          <Button variant="outline" onClick={handleStartEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Ticket
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-slate-500">{ticket.ticket_number}</span>
                    <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                    <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  </div>
                  {isEditing ? (
                    <Input
                      value={editedTicket.subject}
                      onChange={(e) => setEditedTicket({ ...editedTicket, subject: e.target.value })}
                      className="text-2xl font-bold mb-2"
                    />
                  ) : (
                    <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                  )}
                  {isEditing ? (
                    <Textarea
                      value={editedTicket.description}
                      onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-600 mt-2">{ticket.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.author_type === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.author_type === 'user' ? 'tenant-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {message.author_name?.charAt(0) || 'U'}
                    </div>
                    <div className={`flex-1 ${message.author_type === 'user' ? 'text-left' : 'text-right'}`}>
                      <div className={`inline-block rounded-2xl px-4 py-3 max-w-[80%] ${
                        message.author_type === 'user'
                          ? message.is_internal
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-slate-100'
                          : 'tenant-primary text-white'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium ${message.author_type === 'user' ? '' : 'text-white'}`}>
                            {message.author_name}
                          </p>
                          {message.is_internal && (
                            <Lock className="h-3 w-3 text-amber-600" />
                          )}
                        </div>
                        <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                          {message.message_body}
                        </ReactMarkdown>
                        <p className={`text-xs mt-2 ${message.author_type === 'user' ? 'text-slate-500' : 'text-white/70'}`}>
                          {new Date(message.created_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {hasPermission('reply_tickets') && (
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      <Lock className="h-4 w-4 text-amber-600" />
                      Internal Note (not visible to contact)
                    </label>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || addMessageMutation.isPending}
                      className="tenant-primary"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isInternal ? 'Add Note' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Remote Support */}
          {hasPermission('reply_tickets') && (
            <RemoteSupport ticket={ticket} tenantId={currentTenant.id} />
          )}

          {/* Contact Info */}
          {contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Name</p>
                  <p className="text-slate-900">{contact.first_name} {contact.last_name}</p>
                </div>
                {contact.email && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <a href={`mailto:${contact.email}`} className="text-sm tenant-text-accent hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <a href={`tel:${contact.phone}`} className="text-sm tenant-text-accent hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Company
                    </p>
                    <p className="text-sm text-slate-900">{contact.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-600">Type</p>
                  <Badge variant="outline">{contact.contact_type}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ticket Properties</CardTitle>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={handleUpdateTicket} className="tenant-primary">
                      <Save className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Status</Label>
                {isEditing ? (
                  <Select
                    value={editedTicket.status}
                    onValueChange={(value) => setEditedTicket({ ...editedTicket, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1">
                    <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Priority</Label>
                {isEditing ? (
                  <Select
                    value={editedTicket.priority}
                    onValueChange={(value) => setEditedTicket({ ...editedTicket, priority: value })}
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
                ) : (
                  <p className="mt-1">
                    <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  </p>
                )}
              </div>

              {ticket.category && (
                <div>
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <p className="mt-1 text-sm text-slate-900">{ticket.category}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </Label>
                <p className="mt-1 text-sm text-slate-900">
                  {new Date(ticket.created_date).toLocaleString()}
                </p>
              </div>

              {ticket.custom_fields && Object.keys(ticket.custom_fields).length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-3">Custom Fields</p>
                  <div className="space-y-2">
                    {Object.entries(ticket.custom_fields).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key}>
                          <p className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-900">{value.toString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}