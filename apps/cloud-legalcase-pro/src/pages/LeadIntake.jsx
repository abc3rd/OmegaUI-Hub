import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Shield, Phone, Mail, User, Car, Calendar, MapPin } from 'lucide-react';

const caseTypes = [
  { value: 'auto_accident', label: 'Auto Accident', icon: '🚗' },
  { value: 'slip_fall', label: 'Slip and Fall', icon: '⚠️' },
  { value: 'medical_malpractice', label: 'Medical Malpractice', icon: '🏥' },
  { value: 'wrongful_death', label: 'Wrongful Death', icon: '⚖️' },
  { value: 'product_liability', label: 'Product Liability', icon: '📦' },
  { value: 'premises_liability', label: 'Premises Liability', icon: '🏢' },
  { value: 'workers_comp', label: 'Workers Compensation', icon: '👷' },
  { value: 'other', label: 'Other Injury', icon: '📋' },
];

export default function LeadIntake() {
  const [affiliateData, setAffiliateData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    client_email: '',
    client_phone: '',
    lead_type: '',
    incident_date: '',
    city: '',
    state: 'FL',
    incident_description: '',
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const source = urlParams.get('source') || 'direct_link';
    const linkId = urlParams.get('lid');
    
    if (ref) {
      // Lookup affiliate by code
      lookupAffiliate(ref, source, linkId);
    }
  }, []);

  const lookupAffiliate = async (code, source, linkId) => {
    try {
      const affiliates = await base44.entities.Affiliate.filter({ affiliate_code: code });
      if (affiliates.length > 0) {
        const affiliate = affiliates[0];
        setAffiliateData({
          affiliate_id: affiliate.id,
          affiliate_code: code,
          affiliate_link_id: linkId,
          referral_source: source,
        });

        // Track click event
        await trackClick(affiliate.id, code, linkId, source);
      }
    } catch (err) {
      console.error('Error looking up affiliate:', err);
    }
  };

  const trackClick = async (affiliateId, code, linkId, source) => {
    try {
      const userAgent = navigator.userAgent;
      const deviceType = /mobile/i.test(userAgent) ? 'mobile' : 
                        /tablet/i.test(userAgent) ? 'tablet' : 'desktop';

      await base44.entities.ClickEvent.create({
        affiliate_id: affiliateId,
        affiliate_code: code,
        affiliate_link_id: linkId || '',
        event_type: source === 'qr' ? 'qr_scan' : 'click',
        user_agent: userAgent,
        device_type: deviceType,
        landing_page: window.location.href,
        referrer: document.referrer || '',
      });

      // Update click count on affiliate link if exists
      if (linkId) {
        const links = await base44.entities.AffiliateLink.filter({ id: linkId });
        if (links.length > 0) {
          const link = links[0];
          await base44.entities.AffiliateLink.update(linkId, {
            click_count: (link.click_count || 0) + 1,
            qr_scan_count: source === 'qr' ? (link.qr_scan_count || 0) + 1 : link.qr_scan_count
          });
        }
      }
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // Generate lead number
      const leadNumber = `L-${Date.now().toString().slice(-6)}`;
      
      const leadData = {
        lead_number: leadNumber,
        client_name: `${data.first_name} ${data.last_name}`,
        first_name: data.first_name,
        last_name: data.last_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        lead_type: data.lead_type,
        incident_date: data.incident_date,
        city: data.city,
        state: data.state,
        incident_description: data.incident_description,
        status: 'new_intake',
        pipeline_stage: 'new',
        ...affiliateData,
      };

      const lead = await base44.entities.Lead.create(leadData);

      // Update affiliate stats if applicable
      if (affiliateData?.affiliate_id) {
        const affiliates = await base44.entities.Affiliate.filter({ id: affiliateData.affiliate_id });
        if (affiliates.length > 0) {
          const aff = affiliates[0];
          await base44.entities.Affiliate.update(affiliateData.affiliate_id, {
            total_leads: (aff.total_leads || 0) + 1
          });
        }

        // Update link stats
        if (affiliateData.affiliate_link_id) {
          const links = await base44.entities.AffiliateLink.filter({ id: affiliateData.affiliate_link_id });
          if (links.length > 0) {
            const link = links[0];
            await base44.entities.AffiliateLink.update(affiliateData.affiliate_link_id, {
              lead_count: (link.lead_count || 0) + 1
            });
          }
        }
      }

      return lead;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your information has been submitted successfully. One of our legal advisors will contact you within 24 hours.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• A case specialist will review your information</li>
                <li>• You'll receive a call to discuss your case</li>
                <li>• We'll connect you with the right attorney</li>
              </ul>
            </div>
            {affiliateData && (
              <p className="text-xs text-gray-500 mt-6">
                Referred by: {affiliateData.affiliate_code}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white">uCrash</span>
              <span className="text-pink-400 font-bold">.claims</span>
            </div>
          </div>
          <a href="tel:+12393188982" className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors">
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">(239) 318-8982</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Injured in an Accident?
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Get a FREE case evaluation in minutes. We're here to help 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              No Upfront Costs
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              24/7 Support
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Fast Response
            </span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Start Your Free Case Review</h2>
            <p className="text-pink-100">Fill out the form below and we'll get back to you ASAP</p>
          </div>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    First Name *
                  </Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="John"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Last Name *
                  </Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Doe"
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleChange('client_email', e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => handleChange('client_phone', e.target.value)}
                    placeholder="(239) 555-0123"
                    required
                    className="h-12"
                  />
                </div>
              </div>

              {/* Case Info */}
              <div className="space-y-2">
                <Label>Type of Case *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {caseTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('lead_type', type.value)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        formData.lead_type === type.value
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Date of Incident
                  </Label>
                  <Input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => handleChange('incident_date', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    City
                  </Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Fort Myers"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Briefly Describe What Happened</Label>
                <Textarea
                  value={formData.incident_description}
                  onChange={(e) => handleChange('incident_description', e.target.value)}
                  placeholder="Tell us about your accident or injury..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={submitMutation.isPending || !formData.lead_type}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Get My Free Case Review →'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                Your information is secure and confidential
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'No Win, No Fee', desc: 'You pay nothing unless we win your case' },
            { title: 'Fast Response', desc: 'Get a callback within minutes, not days' },
            { title: 'Expert Network', desc: 'Connected to top personal injury attorneys' },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-purple-200 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            © 2024 uCrash.claims | Omega UI, LLC | Fort Myers, FL
          </p>
          <p className="text-white/40 text-xs mt-2">
            This is an attorney advertising service. We are not a law firm.
          </p>
          {affiliateData && (
            <p className="text-white/30 text-xs mt-2">
              Ref: {affiliateData.affiliate_code}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}