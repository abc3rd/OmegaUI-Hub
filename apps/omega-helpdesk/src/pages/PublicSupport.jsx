import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Send } from 'lucide-react';

export default function PublicSupport() {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get('tenant') || 'ucrash';
  
  const [tenant, setTenant] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
    priority: 'normal',
    // uCrash specific fields
    accident_type: '',
    accident_date: '',
    accident_state: '',
    police_report: false,
    has_attorney: false,
    attorney_name: '',
    referral_code: ''
  });

  React.useEffect(() => {
    loadTenant();
  }, [tenantSlug]);

  const loadTenant = async () => {
    const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
    if (tenants.length > 0) {
      setTenant(tenants[0]);
    }
  };

  const submitTicketMutation = useMutation({
    mutationFn: async (data) => {
      // Search for existing contact
      let contact = null;
      const existingContacts = await base44.entities.Contact.filter({
        tenant_id: tenant.id,
        email: data.email
      });

      if (existingContacts.length > 0) {
        contact = existingContacts[0];
      } else {
        // Create new contact
        contact = await base44.entities.Contact.create({
          tenant_id: tenant.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          contact_type: 'client',
          is_active: true
        });
      }

      // Generate ticket number
      const prefix = tenant.slug?.substring(0, 3).toUpperCase() || 'TKT';
      const random = Math.floor(Math.random() * 10000);
      const ticket_number = `${prefix}-${random}`;

      // Create ticket
      const ticket = await base44.entities.Ticket.create({
        tenant_id: tenant.id,
        ticket_number,
        contact_id: contact.id,
        subject: data.subject,
        description: data.description,
        status: 'new',
        priority: data.priority,
        channel: 'web_form',
        category: tenantSlug === 'ucrash' ? 'New Accident Lead' : 'General Support',
        custom_fields: tenantSlug === 'ucrash' ? {
          accident_type: data.accident_type,
          accident_date: data.accident_date,
          accident_state: data.accident_state,
          police_report: data.police_report,
          has_attorney: data.has_attorney,
          attorney_name: data.attorney_name,
          referral_code: data.referral_code
        } : {}
      });

      // Create initial message
      await base44.entities.TicketMessage.create({
        tenant_id: tenant.id,
        ticket_id: ticket.id,
        author_type: 'contact',
        author_id: contact.id,
        author_name: `${data.first_name} ${data.last_name}`,
        message_body: data.description,
        is_internal: false,
        sent_via: 'web_form'
      });

      return { ticket, ticket_number };
    },
    onSuccess: (data) => {
      setTicketNumber(data.ticket_number);
      setSubmitted(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitTicketMutation.mutate(formData);
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primary_color || '#0A1F44';
  const accentColor = tenant.accent_color || '#10B981';

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <style>{`
          .tenant-primary { background-color: ${primaryColor}; }
          .tenant-accent { color: ${accentColor}; }
        `}</style>
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
            <p className="text-slate-600 mb-4">
              {tenant.welcome_message || 'Thank you for contacting us. Your support request has been received.'}
            </p>
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 mb-1">Your Ticket Number</p>
              <p className="text-2xl font-bold tenant-accent">{ticketNumber}</p>
            </div>
            <p className="text-sm text-slate-600">
              We'll review your request and respond to <span className="font-medium">{formData.email}</span> shortly.
            </p>
            {tenant.email_footer && (
              <p className="text-xs text-slate-500 mt-4 border-t pt-4">
                {tenant.email_footer}
              </p>
            )}
            <p className="text-xs text-slate-400 text-center mt-4">
              © 2025 Omega UI, LLC. All Rights Reserved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <style>{`
        .tenant-primary { background-color: ${primaryColor}; }
        .tenant-text-primary { color: ${primaryColor}; }
      `}</style>
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {tenant.logo_url && (
            <img src={tenant.logo_url} alt={tenant.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold tenant-text-primary mb-2">
            {tenant.name} Support
          </h1>
          <p className="text-slate-600">
            {tenant.welcome_message || 'Submit a support request and we\'ll get back to you soon.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-slate-900">Request Details</h3>
                <div>
                  <Label>Subject *</Label>
                  <Input
                    required
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Please provide details about your request..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* uCrash Specific Fields */}
              {tenantSlug === 'ucrash' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-slate-900">Accident Information</h3>
                  <div>
                    <Label>Accident Type</Label>
                    <Select value={formData.accident_type} onValueChange={(value) => setFormData({ ...formData, accident_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Accident</SelectItem>
                        <SelectItem value="truck">Truck Accident</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle Accident</SelectItem>
                        <SelectItem value="slip_fall">Slip & Fall</SelectItem>
                        <SelectItem value="workplace">Workplace Injury</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Accident Date</Label>
                      <Input
                        type="date"
                        value={formData.accident_date}
                        onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        placeholder="FL, GA, SC, etc."
                        value={formData.accident_state}
                        onChange={(e) => setFormData({ ...formData, accident_state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.police_report}
                        onChange={(e) => setFormData({ ...formData, police_report: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Police report filed</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.has_attorney}
                        onChange={(e) => setFormData({ ...formData, has_attorney: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Currently have an attorney</span>
                    </label>
                  </div>
                  {formData.has_attorney && (
                    <div>
                      <Label>Attorney Name</Label>
                      <Input
                        value={formData.attorney_name}
                        onChange={(e) => setFormData({ ...formData, attorney_name: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Referral Code (Optional)</Label>
                    <Input
                      placeholder="Enter referral or QR code"
                      value={formData.referral_code}
                      onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitTicketMutation.isPending}
                className="w-full tenant-primary hover:opacity-90"
              >
                {submitTicketMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>

              {tenant.email_footer && (
                <p className="text-xs text-slate-500 text-center border-t pt-4">
                  {tenant.email_footer}
                </p>
              )}
              <p className="text-xs text-slate-400 text-center mt-2">
                © 2025 Omega UI, LLC. All Rights Reserved.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}