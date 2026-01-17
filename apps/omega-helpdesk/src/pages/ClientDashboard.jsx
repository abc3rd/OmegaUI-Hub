import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Plus,
  Ticket, 
  Clock, 
  CheckCircle2,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function ClientDashboard() {
  const { currentTenant, currentUser } = useTenant();

  const { data: contact } = useQuery({
    queryKey: ['my-contact', currentUser?.email],
    queryFn: async () => {
      const contacts = await base44.entities.Contact.filter({
        tenant_id: currentTenant.id,
        email: currentUser.email
      });
      return contacts[0];
    },
    enabled: !!currentTenant?.id && !!currentUser?.email,
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['my-tickets', contact?.id],
    queryFn: () => base44.entities.Ticket.filter({ 
      tenant_id: currentTenant.id,
      contact_id: contact.id 
    }, '-created_date'),
    enabled: !!contact?.id,
  });

  const { data: kbArticles = [] } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: () => base44.entities.KnowledgeBaseArticle.filter({
      tenant_id: currentTenant.id,
      is_published: true,
      is_internal: false
    }, '-view_count', 5),
    enabled: !!currentTenant?.id,
  });

  const openTickets = myTickets.filter(t => ['new', 'open', 'pending'].includes(t.status));
  const resolvedTickets = myTickets.filter(t => ['resolved', 'closed'].includes(t.status));

  const statusColors = {
    new: 'bg-purple-100 text-purple-700',
    open: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    on_hold: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {currentUser?.full_name}
          </h1>
          <p className="text-slate-600 mt-1">{currentTenant?.name} Support Portal</p>
        </div>
        <Link to={createPageUrl('NewTicket')}>
          <Button className="tenant-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Support Request
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Tickets</p>
                <p className="text-3xl font-bold mt-2">{openTickets.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-3xl font-bold mt-2">{resolvedTickets.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{myTickets.length}</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {myTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No tickets yet</p>
                <Link to={createPageUrl('NewTicket')}>
                  <Button className="mt-4 tenant-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myTickets.slice(0, 5).map(ticket => (
                  <Link 
                    key={ticket.id} 
                    to={createPageUrl('TicketDetail') + `?id=${ticket.id}`}
                    className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium tenant-text-primary">
                        {ticket.ticket_number}
                      </span>
                      <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                    </div>
                    <p className="font-medium mb-1">{ticket.subject}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(ticket.created_date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Popular Articles
              </CardTitle>
              <Link to={createPageUrl('KnowledgeBase')}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {kbArticles.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No articles available</p>
            ) : (
              <div className="space-y-2">
                {kbArticles.map(article => (
                  <Link 
                    key={article.id} 
                    to={createPageUrl('KnowledgeBase') + `?article=${article.id}`}
                    className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <p className="font-medium mb-1">{article.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {article.category && <Badge variant="outline">{article.category}</Badge>}
                      {article.view_count > 0 && <span>{article.view_count} views</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}