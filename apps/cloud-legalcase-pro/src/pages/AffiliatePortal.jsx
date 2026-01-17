import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, Link as LinkIcon, QrCode, TrendingUp, DollarSign, 
  Copy, Download, Plus, Eye, ArrowLeft, ExternalLink, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";
import GHLIntegrationGuide from '../components/affiliate/GHLIntegrationGuide';

export default function AffiliatePortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  const { data: affiliates = [] } = useQuery({
    queryKey: ['affiliates'],
    queryFn: () => base44.entities.Affiliate.list('-created_date'),
  });

  const { data: links = [] } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: () => base44.entities.AffiliateLink.list('-created_date'),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['affiliate-leads'],
    queryFn: () => base44.entities.Lead.filter({ affiliate_id: { $exists: true } }, '-created_date'),
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ['click-events'],
    queryFn: () => base44.entities.ClickEvent.list('-created_date', 100),
  });

  // Stats
  const totalClicks = clicks.length;
  const totalLeads = leads.length;
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : 0;
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Affiliate Portal</h1>
            <p className="text-gray-600">Manage affiliates, links, and track performance</p>
          </div>
          
          <Link to={createPageUrl('NewAffiliate')}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Affiliate
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Affiliates</p>
                  <p className="text-3xl font-bold text-purple-600">{activeAffiliates}</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Clicks</p>
                  <p className="text-3xl font-bold text-blue-600">{totalClicks}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Leads Generated</p>
                  <p className="text-3xl font-bold text-green-600">{totalLeads}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-3xl font-bold text-pink-600">{conversionRate}%</p>
                </div>
                <DollarSign className="w-10 h-10 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-md p-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="links">Links & QR</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="ghl">GHL Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Clicks & Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clicks.slice(0, 10).map(click => (
                    <div key={click.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={click.event_type === 'qr_scan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                          {click.event_type === 'qr_scan' ? 'QR Scan' : 'Click'}
                        </Badge>
                        <span className="font-medium">{click.affiliate_code}</span>
                        <span className="text-sm text-gray-500">{click.device_type}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(click.created_date).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {clicks.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No click events yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>All Affiliates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Code</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Leads</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map(affiliate => (
                        <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-purple-600">
                            {affiliate.affiliate_code}
                          </td>
                          <td className="p-4">
                            {affiliate.first_name} {affiliate.last_name}
                          </td>
                          <td className="p-4 text-gray-600">{affiliate.email}</td>
                          <td className="p-4">
                            <Badge className={
                              affiliate.status === 'active' ? 'bg-green-100 text-green-700' :
                              affiliate.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {affiliate.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-semibold">{affiliate.total_leads || 0}</td>
                          <td className="p-4">
                            <Link to={createPageUrl(`AffiliateDetail?id=${affiliate.id}`)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {affiliates.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No affiliates yet. Add your first affiliate to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Affiliate Links & QR Codes</CardTitle>
                <Link to={createPageUrl('NewAffiliateLink')}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Link
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {links.map(link => (
                    <Card key={link.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge>{link.affiliate_code}</Badge>
                          <Badge variant="outline">{link.slug}</Badge>
                        </div>
                        
                        {link.qr_image_url && (
                          <div className="bg-white p-4 rounded-lg border mb-3 flex justify-center">
                            <img src={link.qr_image_url} alt="QR Code" className="w-32 h-32" />
                          </div>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Clicks:</span>
                            <span className="font-semibold">{link.click_count || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">QR Scans:</span>
                            <span className="font-semibold">{link.qr_scan_count || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Leads:</span>
                            <span className="font-semibold text-green-600">{link.lead_count || 0}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(link.tracking_url);
                              toast.success('Link copied!');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          {link.qr_image_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={link.qr_image_url} download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {links.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No links created yet. Create your first affiliate link.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Affiliate-Referred Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Lead #</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Affiliate</th>
                        <th className="text-left p-4">Source</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono">{lead.lead_number}</td>
                          <td className="p-4">{lead.client_name}</td>
                          <td className="p-4">
                            <Badge variant="outline">{lead.lead_type?.replace('_', ' ')}</Badge>
                          </td>
                          <td className="p-4 font-semibold text-purple-600">
                            {lead.affiliate_code}
                          </td>
                          <td className="p-4">
                            <Badge className={
                              lead.referral_source === 'qr' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }>
                              {lead.referral_source}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={
                              lead.status === 'vetted' ? 'bg-green-100 text-green-700' :
                              lead.status === 'new_intake' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {lead.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(lead.created_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            No affiliate-referred leads yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ghl" className="mt-6">
            <GHLIntegrationGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}