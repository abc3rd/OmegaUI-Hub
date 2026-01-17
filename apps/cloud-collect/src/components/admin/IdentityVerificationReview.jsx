import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, X, AlertCircle, Image as ImageIcon, User, Calendar, MapPin, Hash, Loader2, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  needs_resubmission: { label: "Needs Resubmission", color: "bg-orange-100 text-orange-700" }
};

const idTypeLabels = {
  drivers_license: "Driver's License",
  state_id: "State ID",
  passport: "Passport",
  military_id: "Military ID",
  other: "Other Government ID"
};

export default function IdentityVerificationReview({ verification, profile, onUpdate }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async ({ status, reason }) => {
      const user = await base44.auth.me();
      
      // Update verification record
      await base44.entities.IdentityVerification.update(verification.id, {
        status,
        rejectionReason: reason || null,
        reviewedBy: user.email,
        reviewedAt: new Date().toISOString()
      });

      // If approved, update profile verification
      if (status === 'approved') {
        const currentBadges = profile.verificationBadges || [];
        const newBadges = currentBadges.includes('identity_verified') 
          ? currentBadges 
          : [...currentBadges, 'identity_verified'];

        await base44.entities.Profile.update(profile.id, {
          verificationStatus: 'verified',
          verificationBadges: newBadges,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['identityVerifications']);
      queryClient.invalidateQueries(['profiles']);
      toast.success(decision === 'approved' ? "Verification approved!" : "Verification updated");
      setShowDialog(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    }
  });

  const handleApprove = () => {
    setDecision('approved');
    reviewMutation.mutate({ status: 'approved' });
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setDecision('rejected');
    reviewMutation.mutate({ status: 'rejected', reason: notes });
  };

  const statusBadge = statusConfig[verification.status];

  return (
    <>
      <Card className="border-2 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{profile.publicName}</h4>
                  <p className="text-sm text-slate-500">{idTypeLabels[verification.idType]}</p>
                </div>
                <Badge className={statusBadge.color}>
                  {statusBadge.label}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Name:</span> {verification.fullName}
                </div>
                {verification.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">DOB:</span> {new Date(verification.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                {verification.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Address:</span> {verification.address}
                  </div>
                )}
                {verification.documentNumber && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">Last 4:</span> {verification.documentNumber}
                  </div>
                )}
                <div className="text-xs text-slate-400 pt-2">
                  Submitted: {format(new Date(verification.created_date), 'MMM d, yyyy h:mm a')}
                </div>
              </div>

              {verification.rejectionReason && (
                <Alert className="mt-3 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    <span className="font-semibold">Rejection Reason:</span> {verification.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImages(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View IDs
              </Button>
              {verification.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDialog(true)}
                >
                  Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Dialog */}
      <Dialog open={showImages} onOpenChange={setShowImages}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ID Verification Photos - {verification.fullName}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">ID Front</Label>
              <img 
                src={verification.idFrontImageUrl} 
                alt="ID Front" 
                className="w-full rounded-lg border-2 border-slate-200"
              />
            </div>
            {verification.idBackImageUrl && (
              <div>
                <Label className="text-sm mb-2 block">ID Back</Label>
                <img 
                  src={verification.idBackImageUrl} 
                  alt="ID Back" 
                  className="w-full rounded-lg border-2 border-slate-200"
                />
              </div>
            )}
            <div>
              <Label className="text-sm mb-2 block">Selfie with ID</Label>
              <img 
                src={verification.selfieImageUrl} 
                alt="Selfie" 
                className="w-full rounded-lg border-2 border-slate-200"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Identity Verification</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <p className="font-semibold mb-1">Verification Checklist:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ ID appears genuine and not expired</li>
                  <li>✓ Name matches profile name reasonably</li>
                  <li>✓ Photo on ID matches selfie</li>
                  <li>✓ Document is clearly visible and readable</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Rejection Reason (if rejecting)</Label>
              <Textarea
                id="reviewNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why the verification is being rejected..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && decision === 'rejected' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={reviewMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {reviewMutation.isPending && decision === 'approved' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}