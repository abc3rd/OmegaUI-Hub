import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

export default function CheckTicketStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get('tenant') || 'ucrash';
  
  const [tenant, setTenant] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);

  React.useEffect(() => {
    loadTenant();
  }, [tenantSlug]);

  const loadTenant = async () => {
    const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
    if (tenants.length > 0) {
      setTenant(tenants[0]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    
    try {
      // Search for ticket
      const tickets = await base44.entities.Ticket.filter({
        tenant_id: tenant.id,
        ticket_number: searchTicketNumber
      });

      if (tickets.length > 0) {
        const foundTicket = tickets[0];
        
        // Verify email matches
        const contacts = await base44.entities.Contact.filter({
          id: foundTicket.contact_id,
          email: searchEmail
        });

        if (contacts.length > 0) {
          setTicket(foundTicket);
          setContact(contacts[0]);
          
          // Load messages
          const ticketMessages = await base44.entities.TicketMessage.filter({
            ticket_id: foundTicket.id,
            is_internal: false
          }, '-created_date');
          setMessages(ticketMessages);
        } else {
          alert('Email does not match ticket records');
        }
      } else {
        alert('Ticket not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('An error occurred while searching');
    } finally {
      setSearching(false);
    }
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primary_color || '#0A1F44';
  const accentColor = tenant.accent_color || '#10B981';

  const statusColors = {
    new: 'bg-purple-100 text-purple-700',
    open: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    on_hold: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <style>{`
        .tenant-primary { background-color: ${primaryColor}; }
        .tenant-text-primary { color: ${primaryColor}; }
        .tenant-accent { background-color: ${accentColor}; }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {tenant.logo_url && (
            <img src={tenant.logo_url} alt={tenant.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold tenant-text-primary mb-2">
            Check Ticket Status
          </h1>
          <p className="text-slate-600">
            Enter your email and ticket number to view your request status
          </p>
        </div>

        {/* Search Form */}
        {!ticket && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ticket Number *</Label>
                  <Input
                    required
                    placeholder="e.g., UCR-1234"
                    value={searchTicketNumber}
                    onChange={(e) => setSearchTicketNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={searching}
                  className="w-full tenant-primary hover:opacity-90"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find My Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ticket Details */}
        {ticket && (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => {
                setTicket(null);
                setContact(null);
                setMessages([]);
              }}
            >
              ← New Search
            </Button>

            {/* Ticket Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium tenant-text-primary">
                        {ticket.ticket_number}
                      </span>
                      <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                      <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{ticket.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Contact</p>
                    <p className="font-medium">{contact?.first_name} {contact?.last_name}</p>
                    <p className="text-slate-600">{contact?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Created</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(ticket.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                              ? 'bg-slate-100'
                              : 'tenant-primary text-white'
                          }`}>
                            <p className={`text-sm font-medium mb-1 ${message.author_type === 'user' ? '' : 'text-white'}`}>
                              {message.author_name}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{message.message_body}</p>
                            <p className={`text-xs mt-2 ${message.author_type === 'user' ? 'text-slate-500' : 'text-white/70'}`}>
                              {new Date(message.created_date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {tenant.email_footer && (
              <p className="text-xs text-slate-500 text-center">
                {tenant.email_footer}
              </p>
            )}
            <p className="text-xs text-slate-400 text-center mt-4">
              © 2025 Omega UI, LLC. All Rights Reserved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}