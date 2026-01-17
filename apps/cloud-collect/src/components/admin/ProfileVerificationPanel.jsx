import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, XCircle, Users, CreditCard, Clock, User, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

const badgeOptions = [
  { id: "identity_verified", label: "Identity Verified", icon: Shield, description: "Admin has verified this person's identity" },
  { id: "story_verified", label: "Story Verified", icon: CheckCircle2, description: "Story has been reviewed and confirmed" },
  { id: "community_vouched", label: "Community Vouched", icon: Users, description: "Community members or organizations vouch for this person" },
  { id: "stripe_verified", label: "Payment Verified", icon: CreditCard, description: "Stripe account KYC completed" }
];

const statusConfig = {
  unverified: { label: "Unverified", color: "bg-slate-100 text-slate-700", icon: User },
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  verified: { label: "Verified", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle }
};

export default function ProfileVerificationPanel({ profile, onUpdate }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(profile.verificationStatus || "unverified");
  const [selectedBadges, setSelectedBadges] = useState(profile.verificationBadges || []);
  const [notes, setNotes] = useState(profile.verificationNotes || "");

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Profile.update(profile.id, {
        ...data,
        verifiedAt: data.verificationStatus === "verified" ? new Date().toISOString() : profile.verifiedAt,
        verifiedBy: data.verificationStatus === "verified" ? user.email : profile.verifiedBy
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      toast.success("Verification status updated!");
      setShowDialog(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      verificationStatus: selectedStatus,
      verificationBadges: selectedBadges,
      verificationNotes: notes
    });
  };

  const toggleBadge = (badgeId) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(b => b !== badgeId)
        : [...prev, badgeId]
    );
  };

  const currentStatus = statusConfig[profile.verificationStatus] || statusConfig.unverified;
  const CurrentIcon = currentStatus.icon;

  // Auto-check stripe verification based on account status
  React.useEffect(() => {
    if (profile.stripeAccountStatus === 'verified' && !selectedBadges.includes('stripe_verified')) {
      setSelectedBadges(prev => [...prev, 'stripe_verified']);
    }
  }, [profile.stripeAccountStatus]);

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Verification Status</CardTitle>
              <CardDescription>Manage verification badges</CardDescription>
            </div>
          </div>
          <Badge className={currentStatus.color}>
            <CurrentIcon className="w-3.5 h-3.5 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Badges */}
        {profile.verificationBadges && profile.verificationBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.verificationBadges.map(badgeId => {
              const badge = badgeOptions.find(b => b.id === badgeId);
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <Badge key={badgeId} variant="outline" className="py-1">
                  <Icon className="w-3 h-3 mr-1" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Verification Info */}
        {profile.verifiedAt && (
          <div className="text-sm text-slate-500">
            Verified on {format(new Date(profile.verifiedAt), 'MMM d, yyyy')} 
            {profile.verifiedBy && ` by ${profile.verifiedBy}`}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Manage Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Profile Verification</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Status Selection */}
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        onClick={() => setSelectedStatus(status)}
                        className="justify-start"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Badge Selection */}
              <div className="space-y-3">
                <Label>Verification Badges</Label>
                {badgeOptions.map(badge => {
                  const Icon = badge.icon;
                  const isChecked = selectedBadges.includes(badge.id);
                  const isAutomatic = badge.id === 'stripe_verified' && profile.stripeAccountStatus === 'verified';
                  
                  return (
                    <div 
                      key={badge.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => !isAutomatic && toggleBadge(badge.id)}
                    >
                      <Checkbox 
                        checked={isChecked} 
                        disabled={isAutomatic}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-600" />
                          <span className="font-medium">{badge.label}</span>
                          {isAutomatic && (
                            <Badge variant="outline" className="text-xs">Auto</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this verification..."
                  className="min-h-[80px]"
                />
              </div>

              {selectedStatus === "rejected" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Rejecting a profile will remove all verification badges and may affect the recipient's visibility.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}