import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Link as LinkIcon, QrCode, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NewAffiliate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdAffiliate, setCreatedAffiliate] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    payout_method: 'zelle',
    payout_details: '',
    commission_rate: 25,
    notes: '',
  });

  const generateAffiliateCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `UCRASH-${num}`;
  };

  const generateQRCode = (url) => {
    // Using QR Server API for QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  };

  const createAffiliateMutation = useMutation({
    mutationFn: async (data) => {
      const affiliateCode = generateAffiliateCode();
      const baseUrl = window.location.origin;
      const landingUrl = `${baseUrl}${createPageUrl('LeadIntake')}`;
      
      // Create affiliate
      const affiliate = await base44.entities.Affiliate.create({
        ...data,
        affiliate_code: affiliateCode,
        default_landing_url: landingUrl,
        total_leads: 0,
        total_conversions: 0,
        total_earnings: 0,
      });

      // Create default tracking link
      const trackingUrl = `${landingUrl}?ref=${affiliateCode}&source=direct_link`;
      const qrUrl = `${landingUrl}?ref=${affiliateCode}&source=qr`;
      const qrImageUrl = generateQRCode(qrUrl);

      const link = await base44.entities.AffiliateLink.create({
        affiliate_id: affiliate.id,
        affiliate_code: affiliateCode,
        slug: 'default',
        campaign_name: 'Default Campaign',
        tracking_url: trackingUrl,
        qr_image_url: qrImageUrl,
        landing_page: landingUrl,
        status: 'active',
        click_count: 0,
        qr_scan_count: 0,
        lead_count: 0,
        conversion_count: 0,
      });

      return { affiliate, link };
    },
    onSuccess: ({ affiliate, link }) => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
      setCreatedAffiliate(affiliate);
      setCreatedLink(link);
      setStep(2);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAffiliateMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (step === 2 && createdAffiliate && createdLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Affiliate Created Successfully!</h2>
              <p className="text-green-100">
                {createdAffiliate.first_name} {createdAffiliate.last_name} is now ready to start referring leads
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Affiliate Code */}
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <p className="text-sm text-purple-600 font-medium mb-2">Affiliate Code</p>
                <p className="text-4xl font-bold text-purple-700 font-mono">
                  {createdAffiliate.affiliate_code}
                </p>
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
                    Copy
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <Label className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="w-4 h-4" />
                  QR Code for Mobile Scanning
                </Label>
                <div className="inline-block bg-white p-4 rounded-xl border-2 border-purple-200 shadow-lg">
                  <img 
                    src={createdLink.qr_image_url} 
                    alt="Affiliate QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <a href={createdLink.qr_image_url} download={`QR-${createdAffiliate.affiliate_code}.png`}>
                      Download QR Code
                    </a>
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link to={createPageUrl('AffiliatePortal')} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View All Affiliates
                  </Button>
                </Link>
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={() => {
                    setStep(1);
                    setCreatedAffiliate(null);
                    setCreatedLink(null);
                    setFormData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      status: 'active',
                      payout_method: 'zelle',
                      payout_details: '',
                      commission_rate: 25,
                      notes: '',
                    });
                  }}
                >
                  Add Another Affiliate
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
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Affiliate</h1>
          <p className="text-gray-600">Create an affiliate account with tracking link and QR code</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Affiliate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(239) 555-0123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout_method">Payout Method</Label>
                  <Select value={formData.payout_method} onValueChange={(v) => handleChange('payout_method', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="ach">ACH Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => handleChange('commission_rate', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout_details">Payout Details</Label>
                <Input
                  id="payout_details"
                  value={formData.payout_details}
                  onChange={(e) => handleChange('payout_details', e.target.value)}
                  placeholder="Email for Zelle, account info, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes about this affiliate"
                  rows={3}
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
              disabled={createAffiliateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createAffiliateMutation.isPending ? 'Creating...' : 'Create Affiliate & Generate Links'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}