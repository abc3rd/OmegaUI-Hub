import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Scale, AlertTriangle, TrendingUp, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CaseCard from '../components/cases/CaseCard';

export default function Dashboard() {
  const [selectedCaseType, setSelectedCaseType] = useState('all');

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date'),
  });

  const { data: upcomingDeadlines = [] } = useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const allEvents = await base44.entities.TimelineEvent.list('-event_date', 100);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return allEvents.filter(event => 
        event.is_deadline && 
        !event.completed &&
        new Date(event.event_date) > now &&
        new Date(event.event_date) < thirtyDaysFromNow
      ).slice(0, 5);
    },
  });

  const activeCases = cases.filter(c => c.status === 'active');
  const criticalCases = cases.filter(c => c.priority === 'critical' || c.priority === 'high');

  const casesByType = cases.reduce((acc, c) => {
    acc[c.case_type] = (acc[c.case_type] || 0) + 1;
    return acc;
  }, {});

  const filteredCases = selectedCaseType === 'all' 
    ? cases 
    : cases.filter(c => c.case_type === selectedCaseType);

  const statCards = [
    {
      title: 'Total Cases',
      value: cases.length,
      icon: Scale,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      title: 'Active Cases',
      value: activeCases.length,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Critical Priority',
      value: criticalCases.length,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
              Legal Toolkit
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive case management for all your legal needs
            </p>
          </div>
          
          <Link to={createPageUrl('NewCase')}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6">
              <Plus className="w-5 h-5 mr-2" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Case Type Filter */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Filter by Case Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCaseType === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCaseType('all')}
                className={selectedCaseType === 'all' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
              >
                All Cases ({cases.length})
              </Button>
              {Object.entries(casesByType).map(([type, count]) => (
                <Button
                  key={type}
                  variant={selectedCaseType === type ? 'default' : 'outline'}
                  onClick={() => setSelectedCaseType(type)}
                  className={selectedCaseType === type ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                >
                  {type.replace('_', ' ')} ({count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Upcoming Deadlines (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{deadline.title}</p>
                      <p className="text-sm text-gray-600">{deadline.description}</p>
                    </div>
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      {new Date(deadline.event_date).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cases Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cases</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-gray-200" />
                  <CardContent className="h-48 bg-gray-100" />
                </Card>
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Found</h3>
                <p className="text-gray-600 mb-6">Start by creating your first case</p>
                <Link to={createPageUrl('NewCase')}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Case
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map(caseData => (
                <CaseCard
                  key={caseData.id}
                  case={caseData}
                  onClick={() => {/* Navigate to case detail */}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={createPageUrl('PatentToolkit')}>
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all">
                  <div className="text-left">
                    <div className="font-semibold">Patent Toolkit</div>
                    <div className="text-sm text-gray-600">File and manage patents</div>
                  </div>
                </Button>
              </Link>
              
              <Link to={createPageUrl('Resources')}>
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all">
                  <div className="text-left">
                    <div className="font-semibold">Resources</div>
                    <div className="text-sm text-gray-600">Legal resources & templates</div>
                  </div>
                </Button>
              </Link>
              
              <Link to={createPageUrl('Contacts')}>
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all">
                  <div className="text-left">
                    <div className="font-semibold">Contacts</div>
                    <div className="text-sm text-gray-600">Attorneys & experts</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}