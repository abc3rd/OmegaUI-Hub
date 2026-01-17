import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Bell, Phone, UserPlus, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="bg-gray-800 border-gray-700 text-white">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ActionButton = ({ title, icon: Icon, href }) => (
    <Link to={createPageUrl(href)} className="flex-1">
        <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gray-800 hover:bg-gray-700 border-gray-700 text-white">
            <Icon className="h-6 w-6 text-cyan-400" />
            <span>{title}</span>
        </Button>
    </Link>
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard title="New Leads Today" value="12" icon={UserPlus} color="text-green-400" />
        <StatCard title="Revenue Today" value="$1,280" icon={DollarSign} color="text-green-400" />
        <StatCard title="Upcoming Tasks" value="8" icon={Calendar} color="text-yellow-400" />
        <StatCard title="Notifications" value="3" icon={Bell} color="text-red-400" />
      </div>

      <div className="flex gap-4">
        <ActionButton title="New Lead" icon={UserPlus} href="Leads" />
        <ActionButton title="Make Call" icon={Phone} href="Inbox" />
        <ActionButton title="New Sale" icon={CreditCard} href="POS" />
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-3 text-cyan-400" />
              <p>Call with <span className="font-semibold">John Doe</span> logged.</p>
              <time className="ml-auto text-xs text-gray-500">5m ago</time>
            </li>
            <li className="flex items-center">
              <CreditCard className="h-4 w-4 mr-3 text-green-400" />
              <p>New sale of <span className="font-semibold">$250</span> processed.</p>
              <time className="ml-auto text-xs text-gray-500">1h ago</time>
            </li>
            <li className="flex items-center">
              <UserPlus className="h-4 w-4 mr-3 text-purple-400" />
              <p>New lead from GHL: <span className="font-semibold">Jane Smith</span>.</p>
              <time className="ml-auto text-xs text-gray-500">3h ago</time>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}