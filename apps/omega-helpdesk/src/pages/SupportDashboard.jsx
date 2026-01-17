import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Inbox,
  UserCheck
} from 'lucide-react';

export default function SupportDashboard() {
  const { currentTenant, currentUser, tenants } = useTenant();

  // Fetch data across all assigned tenants for support staff
  const assignedTenantIds = currentUser?.user_role === 'super_admin' 
    ? tenants.map(t => t.id)
    : currentUser?.assigned_tenants || [currentTenant?.id];

  const { data: allTickets = [] } = useQuery({
    queryKey: ['support-tickets', assignedTenantIds],
    queryFn: () => base44.entities.Ticket.list('-created_date', 1000),
    enabled: !!assignedTenantIds.length,
  });

  const { data: allContacts = [] } = useQuery({
    queryKey: ['support-contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  // Filter tickets for assigned tenants
  const tickets = allTickets.filter(t => assignedTenantIds.includes(t.tenant_id));
  
  const openTickets = tickets.filter(t => ['new', 'open', 'pending'].includes(t.status));
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && ['new', 'open', 'pending'].includes(t.status));
  const newTickets = tickets.filter(t => t.status === 'new');
  const myTickets = tickets.filter(t => t.assigned_to === currentUser?.email && ['new', 'open', 'pending'].includes(t.status));

  // Group by tenant
  const ticketsByTenant = tenants.reduce((acc, tenant) => {
    acc[tenant.id] = tickets.filter(t => t.tenant_id === tenant.id);
    return acc;
  }, {});

  // Group by department
  const departments = [...new Set(tickets.map(t => t.department).filter(Boolean))];
  const ticketsByDepartment = departments.reduce((acc, dept) => {
    acc[dept] = tickets.filter(t => t.department === dept);
    return acc;
  }, {});

  const neonColors = {
    magenta: '#ea00ea',
    purple: '#a855f7',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    green: '#10b981',
    yellow: '#eab308',
    dark: '#c3c3c3'
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
      <style>{`
        .neon-card {
          background: linear-gradient(135deg, ${neonColors.dark} 0%, #2a2a2a 100%);
          border: 2px solid ${neonColors.magenta};
          box-shadow: 0 0 20px ${neonColors.magenta}40, inset 0 0 20px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .neon-card:hover {
          box-shadow: 0 0 30px ${neonColors.magenta}80, inset 0 0 20px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        .neon-text {
          color: ${neonColors.magenta};
          text-shadow: 0 0 10px ${neonColors.magenta}, 0 0 20px ${neonColors.magenta}80;
        }
        .neon-purple { 
          color: ${neonColors.purple}; 
          text-shadow: 0 0 10px ${neonColors.purple}, 0 0 20px ${neonColors.purple}80;
        }
        .neon-blue { 
          color: ${neonColors.blue}; 
          text-shadow: 0 0 10px ${neonColors.blue}, 0 0 20px ${neonColors.blue}80;
        }
        .neon-cyan { 
          color: ${neonColors.cyan}; 
          text-shadow: 0 0 10px ${neonColors.cyan}, 0 0 20px ${neonColors.cyan}80;
        }
        .neon-green { 
          color: ${neonColors.green}; 
          text-shadow: 0 0 10px ${neonColors.green}, 0 0 20px ${neonColors.green}80;
        }
        .neon-yellow { 
          color: ${neonColors.yellow}; 
          text-shadow: 0 0 10px ${neonColors.yellow}, 0 0 20px ${neonColors.yellow}80;
        }
        .neon-border-magenta { border-color: ${neonColors.magenta}; }
        .neon-border-purple { border-color: ${neonColors.purple}; }
        .neon-border-blue { border-color: ${neonColors.blue}; }
        .neon-border-cyan { border-color: ${neonColors.cyan}; }
        .neon-border-green { border-color: ${neonColors.green}; }
        .neon-border-yellow { border-color: ${neonColors.yellow}; }
      `}</style>
      
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">Support Dashboard</h1>
            <p className="text-slate-300 text-lg">
              {currentUser?.user_role === 'super_admin' 
                ? `Managing ${tenants.length} tenants` 
                : `Supporting ${currentTenant?.name}`}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to={createPageUrl('Tickets') + '?status=open'}>
            <div className="neon-card neon-border-blue rounded-xl cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Open Tickets</p>
                    <p className="text-4xl font-bold neon-blue">{openTickets.length}</p>
                  </div>
                  <Ticket className="h-12 w-12 neon-blue opacity-70" />
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl('Tickets') + '?priority=urgent'}>
            <div className="neon-card rounded-xl cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Urgent</p>
                    <p className="text-4xl font-bold neon-text">{urgentTickets.length}</p>
                  </div>
                  <AlertCircle className="h-12 w-12 neon-text opacity-70" />
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl('Tickets') + '?status=new'}>
            <div className="neon-card neon-border-purple rounded-xl cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">New Tickets</p>
                    <p className="text-4xl font-bold neon-purple">{newTickets.length}</p>
                  </div>
                  <Inbox className="h-12 w-12 neon-purple opacity-70" />
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl('Tickets') + '?assigned=me'}>
            <div className="neon-card neon-border-green rounded-xl cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Assigned to Me</p>
                    <p className="text-4xl font-bold neon-green">{myTickets.length}</p>
                  </div>
                  <UserCheck className="h-12 w-12 neon-green opacity-70" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Tenant */}
          {currentUser?.user_role === 'super_admin' && (
            <div className="neon-card neon-border-cyan rounded-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold neon-cyan flex items-center gap-2 mb-6">
                  <Building2 className="h-6 w-6" />
                  Tickets by Tenant
                </h3>
                <div className="space-y-3">
                  {tenants.map(tenant => {
                    const tenantTickets = ticketsByTenant[tenant.id] || [];
                    const openCount = tenantTickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length;
                    return (
                      <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-all" style={{ background: 'rgba(60,60,60,0.5)' }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm"
                            style={{ 
                              backgroundColor: tenant.primary_color || '#0A1F44',
                              boxShadow: `0 0 15px ${tenant.primary_color || '#0A1F44'}80`
                            }}
                          >
                            {tenant.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{tenant.name}</p>
                            <p className="text-sm text-slate-400">{tenantTickets.length} total tickets</p>
                          </div>
                        </div>
                        {openCount > 0 && (
                          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-bold">
                            {openCount} open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tickets by Department */}
          {departments.length > 0 && (
            <div className="neon-card neon-border-purple rounded-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold neon-purple flex items-center gap-2 mb-6">
                  <Users className="h-6 w-6" />
                  Tickets by Department
                </h3>
                <div className="space-y-3">
                  {departments.map(dept => {
                    const deptTickets = ticketsByDepartment[dept] || [];
                    const openCount = deptTickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length;
                    return (
                      <div key={dept} className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-700 hover:border-purple-500 transition-all" style={{ background: 'rgba(60,60,60,0.5)' }}>
                        <div>
                          <p className="font-medium text-slate-200">{dept}</p>
                          <p className="text-sm text-slate-400">{deptTickets.length} tickets</p>
                        </div>
                        {openCount > 0 && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
                            {openCount} open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Urgent Tickets */}
          <div className={`neon-card neon-border-yellow rounded-xl ${currentUser?.user_role !== 'super_admin' || departments.length > 0 ? 'lg:col-span-2' : ''}`}>
            <div className="p-6">
              <h3 className="text-xl font-bold neon-yellow flex items-center gap-2 mb-6">
                <AlertCircle className="h-6 w-6" />
                Recent Urgent Tickets
              </h3>
              {urgentTickets.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No urgent tickets</p>
              ) : (
                <div className="space-y-3">
                  {urgentTickets.slice(0, 5).map(ticket => (
                    <Link 
                      key={ticket.id} 
                      to={createPageUrl('TicketDetail') + `?id=${ticket.id}`}
                      className="block p-4 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500 transition-all"
                      style={{ background: 'rgba(234, 179, 8, 0.1)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-200">{ticket.subject}</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {ticket.ticket_number} • {new Date(ticket.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold ml-3">
                          {ticket.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}