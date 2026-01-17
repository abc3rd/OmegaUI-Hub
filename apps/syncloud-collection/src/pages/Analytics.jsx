
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { Contact } from '@/entities/Contact';
import { Project } from '@/entities/Project';
import { Tool } from '@/entities/Tool';
import { Lead } from '@/entities/Lead';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, FolderKanban, Target, Inbox } from 'lucide-react';

const renderActiveShape = (props) => {
// ... a helper function for the PieChart
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="dark:fill-gray-300">{`${value} Projects`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function Analytics() {
    const [dateRange, setDateRange] = useState('30d');
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = useCallback((_, index) => {
        setActiveIndex(index);
    }, []);

    const { data: contacts, isLoading: contactsLoading } = useQuery({ queryKey: ['contacts'], queryFn: () => Contact.list() });
    const { data: projects, isLoading: projectsLoading } = useQuery({ queryKey: ['projects'], queryFn: () => Project.list() });
    const { data: tools, isLoading: toolsLoading } = useQuery({ queryKey: ['tools'], queryFn: () => Tool.list() });
    const { data: leads, isLoading: leadsLoading } = useQuery({ queryKey: ['leads'], queryFn: () => Lead.list() });

    const isLoading = contactsLoading || projectsLoading || toolsLoading || leadsLoading;

    const { kpi, charts } = useMemo(() => {
        if (isLoading || !contacts || !projects || !tools || !leads) {
            return { kpi: {}, charts: {} };
        }

        const dateLimit = subDays(new Date(), parseInt(dateRange.slice(0, -1)));
        
        const recentContacts = contacts.filter(c => new Date(c.created_date) > dateLimit);
        const recentProjects = projects.filter(p => new Date(p.created_date) > dateLimit);
        const recentLeads = leads.filter(l => new Date(l.created_date) > dateLimit);

        // --- KPI Cards ---
        const kpiData = {
            totalContacts: contacts.length,
            totalProjects: projects.length,
            totalLeads: leads.length,
            totalTools: tools.length,
            newContacts: recentContacts.length,
            newProjects: recentProjects.length,
            newLeads: recentLeads.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
        };

        // --- Chart Data ---
        // Growth Chart (Contacts & Projects)
        const days = eachDayOfInterval({ start: dateLimit, end: new Date() });
        const growthData = days.map(day => {
            const formattedDay = format(day, 'MMM d');
            return {
                date: formattedDay,
                Contacts: recentContacts.filter(c => format(new Date(c.created_date), 'MMM d') === formattedDay).length,
                Projects: recentProjects.filter(p => format(new Date(p.created_date), 'MMM d') === formattedDay).length,
            };
        });

        // Project Status Pie Chart
        const projectStatusData = projects.reduce((acc, p) => {
            const status = p.status || 'draft';
            const existing = acc.find(item => item.name === status);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: status, value: 1 });
            }
            return acc;
        }, []);

        // Top Tools Bar Chart
        const topToolsData = [...tools]
            .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
            .slice(0, 5)
            .map(t => ({ name: t.name, Usage: t.usage_count || 0 }));
            
        return { kpi: kpiData, charts: { growthData, projectStatusData, topToolsData } };

    }, [dateRange, contacts, projects, tools, leads, isLoading]);

    const PIE_COLORS = ['#3B82F6', '#10B981', '#F97316', '#A855F7'];

    const renderContent = () => {
        if (isLoading) {
            return <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
                 <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        }

        if (!contacts && !projects && !tools && !leads) {
            return <div className="text-center py-20">
                <Inbox className="w-16 h-16 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No data to analyze</h3>
                <p className="mt-2 text-sm text-muted-foreground">Start using the platform to see your analytics here.</p>
            </div>
        }
        
        return <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Contacts</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpi.totalContacts}</div><p className="text-xs text-muted-foreground">+{kpi.newContacts} in last {dateRange.slice(0,-1)} days</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><FolderKanban className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpi.totalProjects}</div><p className="text-xs text-muted-foreground">+{kpi.newProjects} in last {dateRange.slice(0,-1)} days</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Leads</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpi.totalLeads}</div><p className="text-xs text-muted-foreground">+{kpi.newLeads} new leads</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Projects</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpi.activeProjects}</div><p className="text-xs text-muted-foreground">Currently in progress</p></CardContent></Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="col-span-full">
                    <CardHeader><CardTitle>Growth Overview</CardTitle><CardDescription>New contacts and projects created over the selected period.</CardDescription></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.growthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Contacts" stroke="#3B82F6" strokeWidth={2} />
                                <Line type="monotone" dataKey="Projects" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Project Status</CardTitle><CardDescription>Distribution of all projects by their current status.</CardDescription></CardHeader>
                    <CardContent className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={charts.projectStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" onMouseEnter={onPieEnter} >
                                     {charts.projectStatusData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Top 5 Tools by Usage</CardTitle><CardDescription>Most frequently used tools across the platform.</CardDescription></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={charts.topToolsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Usage" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    }

    return (
        <div className="p-6 space-y-6 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Analytics</h1>
                    <p className="text-muted-foreground">An overview of your platform's performance and engagement.</p>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {renderContent()}
        </div>
    );
}
