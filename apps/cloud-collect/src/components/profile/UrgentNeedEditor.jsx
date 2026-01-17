import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Save, X, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function UrgentNeedEditor({ profile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    hasUrgentNeed: profile.hasUrgentNeed || false,
    urgentNeedTitle: profile.urgentNeedTitle || "",
    urgentNeedDescription: profile.urgentNeedDescription || "",
    urgentNeedAmount: profile.urgentNeedAmount || "",
    urgentNeedDeadline: profile.urgentNeedDeadline ? profile.urgentNeedDeadline.split('T')[0] : ""
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Profile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myProfileForEdit']);
      toast.success(formData.hasUrgentNeed ? "Urgent need activated!" : "Urgent need removed");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    }
  });

  const handleSave = () => {
    if (formData.hasUrgentNeed && !formData.urgentNeedTitle) {
      toast.error("Please enter a title for your urgent need");
      return;
    }
    if (formData.hasUrgentNeed && !formData.urgentNeedAmount) {
      toast.error("Please enter the amount needed");
      return;
    }

    updateMutation.mutate({
      hasUrgentNeed: formData.hasUrgentNeed,
      urgentNeedTitle: formData.hasUrgentNeed ? formData.urgentNeedTitle : null,
      urgentNeedDescription: formData.hasUrgentNeed ? formData.urgentNeedDescription : null,
      urgentNeedAmount: formData.hasUrgentNeed ? parseFloat(formData.urgentNeedAmount) : null,
      urgentNeedDeadline: formData.hasUrgentNeed && formData.urgentNeedDeadline 
        ? new Date(formData.urgentNeedDeadline).toISOString() 
        : null,
      urgentNeedRaisedAmount: profile.urgentNeedRaisedAmount || 0
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-2 border-red-200 bg-red-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Urgent Need</CardTitle>
              <CardDescription>
                Highlight a critical, time-sensitive need
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={formData.hasUrgentNeed}
            onCheckedChange={(checked) => handleChange("hasUrgentNeed", checked)}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </CardHeader>

      {formData.hasUrgentNeed && (
        <CardContent className="space-y-4 pt-0">
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Urgent needs get special visibility on your profile with a prominent banner. Use this for genuine emergencies only.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="urgentTitle">What do you urgently need?</Label>
            <Input
              id="urgentTitle"
              placeholder="e.g., Emergency Medical Bill, Rent Due Tomorrow"
              value={formData.urgentNeedTitle}
              onChange={(e) => handleChange("urgentNeedTitle", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgentDescription">Details (optional)</Label>
            <Textarea
              id="urgentDescription"
              placeholder="Explain the situation and why it's urgent..."
              value={formData.urgentNeedDescription}
              onChange={(e) => handleChange("urgentNeedDescription", e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgentAmount">Amount Needed ($)</Label>
              <Input
                id="urgentAmount"
                type="number"
                placeholder="0.00"
                value={formData.urgentNeedAmount}
                onChange={(e) => handleChange("urgentNeedAmount", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgentDeadline">Deadline (optional)</Label>
              <Input
                id="urgentDeadline"
                type="date"
                value={formData.urgentNeedDeadline}
                onChange={(e) => handleChange("urgentNeedDeadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Urgent Need
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}