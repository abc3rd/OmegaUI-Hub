import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function Reports() {
  const { currentTenant } = useTenant();

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', currentTenant?.id],
    queryFn: () => base44.entities.Ticket.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all_messages', currentTenant?.id],
    queryFn: () => base44.entities.TicketMessage.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = tickets.filter(t => {
      const created = new Date(t.created_date);
      return (now - created) / (1000 * 60 * 60 * 24) <= 30;
    });

    // Tickets by status
    const byStatus = tickets.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Tickets by priority
    const byPriority = tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    // Tickets by channel
    const byChannel = tickets.reduce((acc, t) => {
      acc[t.channel] = (acc[t.channel] || 0) + 1;
      return acc;
    }, {});

    // Response times
    const responseTimes = tickets
      .filter(t => t.first_response_at)
      .map(t => {
        const created = new Date(t.created_date);
        const responded = new Date(t.first_response_at);
        return (responded - created) / (1000 * 60 * 60); // hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Daily ticket volume (last 7 days)
    const dailyVolume = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = tickets.filter(t => {
        const tDate = new Date(t.created_date);
        return tDate.toDateString() === date.toDateString();
      }).length;

      dailyVolume.push({ date: dateStr, count });
    }

    return {
      total: tickets.length,
      last30Days: last30Days.length,
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      byPriority: Object.entries(byPriority).map(([name, value]) => ({ name, value })),
      byChannel: Object.entries(byChannel).map(([name, value]) => ({ name, value })),
      avgResponseTime: avgResponseTime.toFixed(1),
      dailyVolume,
      totalMessages: messages.length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
    };
  }, [tickets, messages]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const exportToCSV = () => {
    const headers = ['Ticket Number', 'Subject', 'Status', 'Priority', 'Created Date', 'Contact', 'Category'];
    const rows = tickets.map(t => [
      t.ticket_number,
      t.subject,
      t.status,
      t.priority,
      new Date(t.created_date).toLocaleString(),
      t.contact_id,
      t.category || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Insights and performance metrics</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {analytics.last30Days} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.avgResponseTime} <span className="text-lg text-slate-500">hrs</span></div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              First response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.resolved}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {((analytics.resolved / analytics.total) * 100).toFixed(0)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalMessages}</div>
            <p className="text-xs text-slate-500 mt-1">
              {(analytics.totalMessages / analytics.total || 0).toFixed(1)} avg per ticket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.byChannel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}