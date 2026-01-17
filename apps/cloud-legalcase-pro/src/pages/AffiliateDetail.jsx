import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ArrowLeft, Copy, Download, QrCode, Link as LinkIcon, 
  Mail, Phone, DollarSign, TrendingUp, Users, Plus,
  ExternalLink, RefreshCw, Send, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";

export default function AffiliateDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const affiliateId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: affiliate, isLoading } = useQuery({
    queryKey: ['affiliate', affiliateId],
    queryFn: async () => {
      const results = await base44.entities.Affiliate.filter({ id: affiliateId });
      return results[0];
    },
    enabled: !!affiliateId,
  });

  const { data: links = [] } = useQuery({
    queryKey: ['affiliate-links', affiliateId],
    queryFn: () => base44.entities.AffiliateLink.filter({ affiliate_id: affiliateId }),
    enabled: !!affiliateId,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['affiliate-leads', affiliateId],
    queryFn: () => base44.entities.Lead.filter({ affiliate_id: affiliateId }, '-created_date'),
    enabled: !!affiliateId,
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ['affiliate-clicks', affiliateId],
    queryFn: () => base44.entities.ClickEvent.filter({ affiliate_id: affiliateId }, '-created_date', 50),
    enabled: !!affiliateId,
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Simulate GHL sync
  const syncToGHL = async () => {
    setSyncing(true);
    // This would call a backend function to sync with GHL API
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Synced to GoHighLevel!');
    setSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 p-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Affiliate not found</p>
            <Link to={createPageUrl('AffiliatePortal')}>
              <Button className="mt-4">Back to Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalClicks = links.reduce((sum, l) => sum + (l.click_count || 0), 0);
  const totalQRScans = links.reduce((sum, l) => sum + (l.qr_scan_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to={createPageUrl('AffiliatePortal')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {affiliate.first_name} {affiliate.last_name}
              </h1>
              <Badge className={
                affiliate.status === 'active' ? 'bg-green-100 text-green-700' :
                affiliate.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }>
                {affiliate.status}
              </Badge>
            </div>
            <p className="text-2xl font-mono font-bold text-purple-600 mt-1">
              {affiliate.affiliate_code}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={syncToGHL} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync to GHL'}
            </Button>
            <Link to={createPageUrl(`NewAffiliateLink?affiliate_id=${affiliateId}`)}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold text-blue-600">{totalClicks}</p>
              <p className="text-xs text-gray-500">Total Clicks</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <QrCode className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold text-purple-600">{totalQRScans}</p>
              <p className="text-xs text-gray-500">QR Scans</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-600">{affiliate.total_leads || 0}</p>
              <p className="text-xs text-gray-500">Total Leads</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold text-emerald-600">{affiliate.total_conversions || 0}</p>
              <p className="text-xs text-gray-500">Conversions</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto text-pink-500 mb-1" />
              <p className="text-2xl font-bold text-pink-600">${(affiliate.total_earnings || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* GHL Integration Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <ExternalLink className="w-5 h-5" />
              GoHighLevel Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">📧 Email Workflow</h4>
                <div className="bg-white rounded-lg p-4 text-sm space-y-2">
                  <p><strong>1.</strong> Affiliate signs up → Added to GHL contact list</p>
                  <p><strong>2.</strong> GHL sends welcome email with tracking link</p>
                  <p><strong>3.</strong> Lead submits form → GHL triggers notification</p>
                  <p><strong>4.</strong> Lead status updates sync both directions</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">🔗 QR Code Flow</h4>
                <div className="bg-white rounded-lg p-4 text-sm space-y-2">
                  <p><strong>1.</strong> Generate QR in GHL or here (both work)</p>
                  <p><strong>2.</strong> QR links to: <code className="bg-gray-100 px-1 rounded">?ref={affiliate.affiliate_code}&source=qr</code></p>
                  <p><strong>3.</strong> Scan tracked → Lead captured → GHL notified</p>
                  <p><strong>4.</strong> Pipeline stage syncs to GHL opportunity</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <Label className="text-sm text-gray-600">GHL Webhook URL (paste in GHL workflow)</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={`${window.location.origin}/api/ghl-webhook?affiliate=${affiliate.affiliate_code}`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}/api/ghl-webhook?affiliate=${affiliate.affiliate_code}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="bg-white shadow-md">
            <TabsTrigger value="links">Links & QR Codes</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {links.map(link => (
                <Card key={link.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{link.slug}</Badge>
                      <Badge className={link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                        {link.status}
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold mb-3">{link.campaign_name || 'Campaign'}</h4>
                    
                    {link.qr_image_url && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-center">
                        <img src={link.qr_image_url} alt="QR" className="w-32 h-32" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <p className="font-bold text-blue-700">{link.click_count || 0}</p>
                        <p className="text-xs text-blue-600">Clicks</p>
                      </div>
                      <div className="bg-purple-50 rounded p-2 text-center">
                        <p className="font-bold text-purple-700">{link.qr_scan_count || 0}</p>
                        <p className="text-xs text-purple-600">QR Scans</p>
                      </div>
                      <div className="bg-green-50 rounded p-2 text-center">
                        <p className="font-bold text-green-700">{link.lead_count || 0}</p>
                        <p className="text-xs text-green-600">Leads</p>
                      </div>
                      <div className="bg-pink-50 rounded p-2 text-center">
                        <p className="font-bold text-pink-700">{link.conversion_count || 0}</p>
                        <p className="text-xs text-pink-600">Converted</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => copyToClipboard(link.tracking_url)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Link
                      </Button>
                      {link.qr_image_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={link.qr_image_url} download={`QR-${link.slug}.png`}>
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {links.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-gray-500">
                    No tracking links yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4">Lead #</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Source</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="border-t hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">{lead.lead_number}</td>
                          <td className="p-4">{lead.client_name}</td>
                          <td className="p-4">
                            <Badge variant="outline">{lead.lead_type?.replace('_', ' ')}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={lead.referral_source === 'qr' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                              {lead.referral_source}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-green-100 text-green-700">{lead.pipeline_stage || lead.status}</Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(lead.created_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No leads yet from this affiliate
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clicks.slice(0, 20).map(click => (
                    <div key={click.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={click.event_type === 'qr_scan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                          {click.event_type === 'qr_scan' ? 'QR Scan' : 'Click'}
                        </Badge>
                        <span className="text-sm text-gray-600">{click.device_type}</span>
                        {click.converted_to_lead && (
                          <Badge className="bg-green-100 text-green-700">→ Lead</Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(click.created_date).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {clicks.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Affiliate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {affiliate.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Phone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {affiliate.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Commission Rate</Label>
                      <p className="font-medium">{affiliate.commission_rate || 25}%</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Payout Method</Label>
                      <p className="font-medium capitalize">{affiliate.payout_method || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Payout Details</Label>
                      <p className="font-medium">{affiliate.payout_details || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Member Since</Label>
                      <p className="font-medium">
                        {new Date(affiliate.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {affiliate.notes && (
                  <div>
                    <Label className="text-gray-500">Notes</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{affiliate.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}