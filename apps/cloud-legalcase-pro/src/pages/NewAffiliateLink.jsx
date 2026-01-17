import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Link as LinkIcon, QrCode, Check, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";

export default function NewAffiliateLink() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createdLink, setCreatedLink] = useState(null);
  
  const [formData, setFormData] = useState({
    affiliate_id: '',
    slug: '',
    campaign_name: '',
    landing_page: '',
    expires_at: '',
  });

  const { data: affiliates = [] } = useQuery({
    queryKey: ['affiliates'],
    queryFn: () => base44.entities.Affiliate.filter({ status: 'active' }),
  });

  const generateQRCode = (url) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  };

  const createLinkMutation = useMutation({
    mutationFn: async (data) => {
      const affiliate = affiliates.find(a => a.id === data.affiliate_id);
      if (!affiliate) throw new Error('Affiliate not found');

      const baseUrl = window.location.origin;
      const landingUrl = data.landing_page || `${baseUrl}${createPageUrl('LeadIntake')}`;
      
      // Create tracking URL with UTM params
      const trackingUrl = `${landingUrl}?ref=${affiliate.affiliate_code}&source=direct_link&campaign=${data.slug}`;
      const qrUrl = `${landingUrl}?ref=${affiliate.affiliate_code}&source=qr&campaign=${data.slug}`;
      const qrImageUrl = generateQRCode(qrUrl);

      const link = await base44.entities.AffiliateLink.create({
        affiliate_id: data.affiliate_id,
        affiliate_code: affiliate.affiliate_code,
        slug: data.slug || 'custom',
        campaign_name: data.campaign_name,
        tracking_url: trackingUrl,
        qr_image_url: qrImageUrl,
        landing_page: landingUrl,
        status: 'active',
        expires_at: data.expires_at || null,
        click_count: 0,
        qr_scan_count: 0,
        lead_count: 0,
        conversion_count: 0,
      });

      return { link, affiliate };
    },
    onSuccess: ({ link, affiliate }) => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
      setCreatedLink({ ...link, affiliate });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createLinkMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (createdLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Link Created!</h2>
              <p className="text-blue-100">
                Campaign: {createdLink.campaign_name} ({createdLink.slug})
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Affiliate Info */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Affiliate</p>
                  <p className="font-bold text-lg">{createdLink.affiliate?.first_name} {createdLink.affiliate?.last_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Code</p>
                  <p className="font-mono font-bold text-purple-600">{createdLink.affiliate_code}</p>
                </div>
              </div>

              {/* Tracking Link */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Tracking Link
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={createdLink.tracking_url} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button onClick={() => copyToClipboard(createdLink.tracking_url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <Label className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Label>
                <div className="inline-block bg-white p-4 rounded-xl border-2 border-purple-200 shadow-lg">
                  <img 
                    src={createdLink.qr_image_url} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <a href={createdLink.qr_image_url} download={`QR-${createdLink.affiliate_code}-${createdLink.slug}.png`}>
                      Download QR Code
                    </a>
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link to={createPageUrl('AffiliatePortal')} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Portal
                  </Button>
                </Link>
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={() => {
                    setCreatedLink(null);
                    setFormData({
                      affiliate_id: '',
                      slug: '',
                      campaign_name: '',
                      landing_page: '',
                      expires_at: '',
                    });
                  }}
                >
                  Create Another Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <div>
          <Link to={createPageUrl('AffiliatePortal')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Affiliate Portal
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Affiliate Link</h1>
          <p className="text-gray-600">Generate a new tracking link and QR code for a campaign</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Link Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="affiliate_id">Select Affiliate *</Label>
                <Select 
                  value={formData.affiliate_id} 
                  onValueChange={(v) => handleChange('affiliate_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an affiliate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliates.map(aff => (
                      <SelectItem key={aff.id} value={aff.id}>
                        {aff.first_name} {aff.last_name} ({aff.affiliate_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name *</Label>
                  <Input
                    id="campaign_name"
                    value={formData.campaign_name}
                    onChange={(e) => handleChange('campaign_name', e.target.value)}
                    placeholder="Facebook Ads Q1 2025"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL identifier) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="fb-ads-q1"
                    required
                  />
                  <p className="text-xs text-gray-500">Used in URL: ?campaign=fb-ads-q1</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing_page">Custom Landing Page URL (optional)</Label>
                <Input
                  id="landing_page"
                  value={formData.landing_page}
                  onChange={(e) => handleChange('landing_page', e.target.value)}
                  placeholder="Leave blank for default intake page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => handleChange('expires_at', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Link to={createPageUrl('AffiliatePortal')}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={createLinkMutation.isPending || !formData.affiliate_id}
            >
              <Save className="w-4 h-4 mr-2" />
              {createLinkMutation.isPending ? 'Creating...' : 'Generate Link & QR Code'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}