import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function RecipientManager({ campaignId, recipients, canEdit }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const addRecipientMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      setEmail("");
      toast.success("Recipient added");
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipient.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      setBulkEmails("");
      setShowBulkAdd(false);
      toast.success("Recipients added");
    },
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      toast.success("Recipient removed");
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }

    await addRecipientMutation.mutateAsync({
      email,
      campaign_id: campaignId,
    });

    // Update campaign total recipients
    await updateCampaignMutation.mutateAsync({
      id: campaignId,
      data: { total_recipients: recipients.length + 1 }
    });
  };

  const handleBulkAdd = async () => {
    const emails = bulkEmails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (emails.length === 0) {
      toast.error("No valid emails found");
      return;
    }

    const recipientData = emails.map(email => ({
      email,
      campaign_id: campaignId,
    }));

    await bulkAddMutation.mutateAsync(recipientData);

    // Update campaign total recipients
    await updateCampaignMutation.mutateAsync({
      id: campaignId,
      data: { total_recipients: recipients.length + emails.length }
    });
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recipients
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {canEdit && (
          <>
            {!showBulkAdd ? (
              <form onSubmit={handleAddEmail} className="mb-6">
                <Label htmlFor="email">Add Recipient</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" disabled={addRecipientMutation.isPending}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-6">
                <Label htmlFor="bulkEmails">Bulk Add Recipients</Label>
                <p className="text-sm text-slate-500 mb-2">
                  Enter email addresses separated by commas or new lines
                </p>
                <Textarea
                  id="bulkEmails"
                  placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="h-32 mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkAdd}
                    disabled={bulkAddMutation.isPending}
                    className="flex-1"
                  >
                    {bulkAddMutation.isPending ? "Adding..." : "Add All"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkAdd(false);
                      setBulkEmails("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recipients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No recipients added yet</p>
            </div>
          ) : (
            recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm text-slate-700 truncate">{recipient.email}</span>
                  {recipient.sent && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Sent
                    </Badge>
                  )}
                </div>
                {canEdit && !recipient.sent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRecipientMutation.mutate(recipient.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}