import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Users, Mail, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import RecipientManager from "../components/campaign/RecipientManager";
import EmailPreview from "../components/campaign/EmailPreview";

export default function CampaignDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const [isSending, setIsSending] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => base44.entities.Campaign.filter({ id: campaignId }).then(res => res[0]),
    enabled: !!campaignId,
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients', campaignId],
    queryFn: () => base44.entities.Recipient.filter({ campaign_id: campaignId }),
    enabled: !!campaignId,
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const handleSendCampaign = async () => {
    if (recipients.length === 0) {
      toast.error("Add at least one recipient before sending");
      return;
    }

    setIsSending(true);
    
    try {
      // Update status to sending
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        data: { status: 'sending' }
      });

      let sentCount = 0;

      // Send emails to all recipients
      for (const recipient of recipients) {
        if (!recipient.sent) {
          await base44.integrations.Core.SendEmail({
            to: recipient.email,
            subject: campaign.subject,
            body: campaign.body,
          });

          // Mark recipient as sent
          await base44.entities.Recipient.update(recipient.id, {
            sent: true,
            sent_at: new Date().toISOString(),
          });

          sentCount++;
        }
      }

      // Update campaign status and sent count
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        data: { 
          status: 'sent',
          sent_count: sentCount,
        }
      });

      queryClient.invalidateQueries({ queryKey: ['recipients', campaignId] });
      toast.success(`Campaign sent successfully to ${sentCount} recipients!`);
    } catch (error) {
      toast.error("Failed to send campaign");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Campaign not found</p>
      </div>
    );
  }

  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "Draft" },
    sending: { color: "bg-blue-100 text-blue-700 border-blue-300", label: "Sending" },
    sent: { color: "bg-green-100 text-green-700 border-green-300", label: "Sent" },
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{campaign.name}</h1>
                <Badge variant="outline" className={`${statusConfig[campaign.status].color} border`}>
                  {statusConfig[campaign.status].label}
                </Badge>
              </div>
              <p className="text-slate-600">Created on {format(new Date(campaign.created_date), "MMMM d, yyyy")}</p>
            </div>
            
            {campaign.status === 'draft' && (
              <Button
                onClick={handleSendCampaign}
                disabled={isSending || recipients.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Recipients</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{recipients.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Emails Sent</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {recipients.filter(r => r.sent).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {recipients.filter(r => !r.sent).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recipients Manager */}
          <RecipientManager 
            campaignId={campaignId} 
            recipients={recipients}
            canEdit={campaign.status === 'draft'}
          />

          {/* Email Preview */}
          <EmailPreview campaign={campaign} />
        </div>
      </div>
    </div>
  );
}