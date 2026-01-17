import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Ticket, 
  Users, 
  Search,
  ArrowRight,
  Mail,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AllTenants() {
  const { currentUser, switchTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['all-tenants'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['all-tickets'],
    queryFn: () => base44.entities.Ticket.list(),
  });

  const { data: allContacts = [] } = useQuery({
    queryKey: ['all-contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  // Only allow super admins
  if (currentUser?.user_role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Access denied. Super admin only.</p>
      </div>
    );
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTenantStats = (tenantId) => {
    const tickets = allTickets.filter(t => t.tenant_id === tenantId);
    const contacts = allContacts.filter(c => c.tenant_id === tenantId);
    const openTickets = tickets.filter(t => ['new', 'open', 'pending'].includes(t.status));
    
    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      contacts: contacts.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Tenants</h1>
          <p className="text-slate-600 mt-1">
            Cross-tenant support administration - {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tenants by name, domain, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading tenants...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map(tenant => {
            const stats = getTenantStats(tenant.id);
            return (
              <Card 
                key={tenant.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  switchTenant(tenant);
                  window.location.href = createPageUrl('Dashboard');
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tenant.logo_url ? (
                        <img 
                          src={tenant.logo_url} 
                          alt={tenant.name} 
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 rounded flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tenant.primary_color || '#0A1F44' }}
                        >
                          {tenant.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{tenant.name}</CardTitle>
                        <p className="text-xs text-slate-500">{tenant.slug}</p>
                      </div>
                    </div>
                    <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{tenant.domain}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{tenant.support_email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                        <Ticket className="h-4 w-4" />
                        {stats.totalTickets}
                      </div>
                      <p className="text-xs text-slate-500">Tickets</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600">
                        <Ticket className="h-4 w-4" />
                        {stats.openTickets}
                      </div>
                      <p className="text-xs text-slate-500">Open</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                        <Users className="h-4 w-4" />
                        {stats.contacts}
                      </div>
                      <p className="text-xs text-slate-500">Contacts</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-3"
                    style={{ backgroundColor: tenant.primary_color || '#0A1F44' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      switchTenant(tenant);
                      window.location.href = createPageUrl('Dashboard');
                    }}
                  >
                    Access Tenant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}