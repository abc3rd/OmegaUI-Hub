import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function Tickets() {
  const { currentTenant, hasPermission } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', currentTenant?.id],
    queryFn: () => base44.entities.Ticket.filter({ tenant_id: currentTenant.id }, '-created_date'),
    enabled: !!currentTenant?.id,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', currentTenant?.id],
    queryFn: () => base44.entities.Contact.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  const contactMap = contacts.reduce((acc, contact) => {
    acc[contact.id] = contact;
    return acc;
  }, {});

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 border-slate-300',
    normal: 'bg-blue-100 text-blue-700 border-blue-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    urgent: 'bg-red-100 text-red-700 border-red-300'
  };

  const statusColors = {
    new: 'bg-purple-100 text-purple-700 border-purple-300',
    open: 'bg-blue-100 text-blue-700 border-blue-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    on_hold: 'bg-orange-100 text-orange-700 border-orange-300',
    resolved: 'bg-green-100 text-green-700 border-green-300',
    closed: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const channelIcons = {
    web_form: '🌐',
    email: '📧',
    phone: '📞',
    sms: '💬',
    chat: '💭',
    whatsapp: '📱'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-600 mt-1">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {hasPermission('reply_tickets') && (
          <Link to={createPageUrl('NewTicket')}>
            <Button className="tenant-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tickets List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-600">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first ticket to get started'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map(ticket => {
            const contact = contactMap[ticket.contact_id];
            const isOverdue = ticket.sla_response_due && 
              new Date(ticket.sla_response_due) < new Date() && 
              !ticket.first_response_at;

            return (
              <Link 
                key={ticket.id} 
                to={createPageUrl('TicketDetail') + `?id=${ticket.id}`}
              >
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono text-sm font-medium tenant-text-primary">
                          {ticket.ticket_number}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[ticket.status]}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                        {ticket.channel && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {channelIcons[ticket.channel]} {ticket.channel.replace('_', ' ')}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-slate-900 mb-1 text-lg">
                        {ticket.subject}
                      </h3>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {ticket.description || 'No description provided'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {contact && (
                          <span>
                            From: <span className="font-medium text-slate-700">
                              {contact.first_name} {contact.last_name}
                            </span>
                          </span>
                        )}
                        {ticket.category && (
                          <span className="flex items-center gap-1">
                            <Filter className="h-3 w-3" />
                            {ticket.category}
                          </span>
                        )}
                        <span>
                          {new Date(ticket.created_date).toLocaleDateString()} at{' '}
                          {new Date(ticket.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {ticket.assigned_to && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Assigned to</p>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full tenant-primary text-white flex items-center justify-center text-sm font-medium">
                            {ticket.assigned_to.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}