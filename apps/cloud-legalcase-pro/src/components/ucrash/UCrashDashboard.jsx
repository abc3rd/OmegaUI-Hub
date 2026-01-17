import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, Activity, ExternalLink } from 'lucide-react';

export default function UCrashDashboard({ leads, attorneys, activeLeads, avgCaseValue, onNavigate }) {
  const metrics = [
    {
      label: 'Active Leads',
      value: activeLeads.length,
      trend: '+12% this week',
      trendColor: 'text-green-500',
      borderColor: 'border-green-500'
    },
    {
      label: 'Avg Case Value',
      value: `$${Math.round(avgCaseValue / 1000)}k`,
      trend: 'Auto Accidents',
      trendColor: 'text-blue-500',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Partner Attorneys',
      value: attorneys.filter(a => a.status === 'active').length,
      trend: 'Florida Region',
      trendColor: 'text-gray-500',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Network Traffic',
      value: '8.4k',
      trend: 'ucrash.claims',
      trendColor: 'text-gray-500',
      borderColor: 'border-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className={`border-b-4 ${metric.borderColor} shadow-lg`}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                {metric.label}
              </p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">
                {metric.value}
              </p>
              <p className={`text-sm ${metric.trendColor}`}>
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-t-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start hover:bg-blue-50 hover:border-blue-500"
              onClick={() => onNavigate('calculator')}
            >
              <div className="text-left">
                <div className="font-semibold">Start New Case Valuation</div>
                <div className="text-sm text-gray-500">Calculate settlement estimates</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start hover:bg-pink-50 hover:border-pink-500"
              onClick={() => onNavigate('marketing')}
            >
              <div className="text-left">
                <div className="font-semibold">Generate Affiliate Links</div>
                <div className="text-sm text-gray-500">Marketing resources</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start hover:bg-green-50 hover:border-green-500"
              onClick={() => window.open('https://ucrash.claims', '_blank')}
            >
              <div className="text-left flex items-center gap-2">
                <div>
                  <div className="font-semibold">View Live Portal</div>
                  <div className="text-sm text-gray-500">ucrash.claims</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>System Status: Omega UI Cloud Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Database Connection:</strong>{' '}
            <span className="text-green-500 font-semibold">Active (SynCloud)</span>
          </p>
          <p>
            <strong>Tracking:</strong>{' '}
            Global Tag ID <code className="bg-gray-100 px-2 py-1 rounded text-sm">G-SNLF60E7LE</code> is active.
          </p>
          <p>
            <strong>Current Node:</strong> Fort Myers, FL (HQ)
          </p>
        </CardContent>
      </Card>

      {/* Recent Leads Preview */}
      {leads.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Leads
              <Button variant="ghost" size="sm" onClick={() => onNavigate('referral')}>
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.slice(0, 3).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{lead.client_name || `Lead #${lead.lead_number}`}</p>
                    <p className="text-sm text-gray-500">{lead.city}, {lead.state}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                      lead.lead_type === 'auto_accident' ? 'bg-pink-500' :
                      lead.lead_type === 'medical_malpractice' ? 'bg-blue-500' :
                      lead.lead_type === 'wrongful_death' ? 'bg-gray-800' :
                      'bg-purple-500'
                    }`}>
                      {lead.lead_type?.replace('_', ' ')}
                    </span>
                    {lead.estimated_value && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        ${lead.estimated_value.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}