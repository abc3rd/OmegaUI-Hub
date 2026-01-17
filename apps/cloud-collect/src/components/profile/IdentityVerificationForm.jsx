import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, Camera, Loader2, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const idTypeOptions = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "state_id", label: "State ID" },
  { value: "passport", label: "Passport" },
  { value: "military_id", label: "Military ID" },
  { value: "other", label: "Other Government ID" }
];

const statusConfig = {
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  approved: { label: "Verified ✓", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: X },
  needs_resubmission: { label: "Needs Resubmission", color: "bg-orange-100 text-orange-700", icon: AlertCircle }
};

export default function IdentityVerificationForm({ profileId, onSuccess }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({ front: false, back: false, selfie: false });
  const [formData, setFormData] = useState({
    idType: "drivers_license",
    idFrontImageUrl: "",
    idBackImageUrl: "",
    selfieImageUrl: "",
    documentNumber: "",
    fullName: "",
    dateOfBirth: "",
    address: ""
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingVerification } = useQuery({
    queryKey: ['identityVerification', profileId],
    queryFn: async () => {
      const verifications = await base44.entities.IdentityVerification.filter({ 
        profileId,
        userId: user.id 
      }, '-created_date', 1);
      return verifications[0] || null;
    },
    enabled: !!user && !!profileId
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.IdentityVerification.create({
        ...data,
        profileId,
        userId: user.id,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['identityVerification']);
      queryClient.invalidateQueries(['myProfileForEdit']);
      toast.success("Identity verification submitted! We'll review it within 24-48 hours.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to submit: " + error.message);
    }
  });

  const handleFileUpload = async (file, field) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [`${field}ImageUrl`]: file_url }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.idFrontImageUrl) {
      toast.error("Please upload a photo of your ID (front)");
      return;
    }
    if (!formData.selfieImageUrl) {
      toast.error("Please upload a selfie with your ID");
      return;
    }
    if (!formData.fullName) {
      toast.error("Please enter your full name as shown on ID");
      return;
    }

    submitMutation.mutate(formData);
  };

  // If verification already exists, show status
  if (existingVerification) {
    const config = statusConfig[existingVerification.status];
    const Icon = config.icon;

    return (
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>Verify your identity to build trust</CardDescription>
              </div>
            </div>
            <Badge className={config.color}>
              <Icon className="w-4 h-4 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={existingVerification.status === 'approved' ? "bg-green-50 border-green-200" : "bg-slate-50"}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {existingVerification.status === 'approved' && (
                <p className="text-green-800">Your identity has been verified! Your profile now has enhanced trust indicators.</p>
              )}
              {existingVerification.status === 'pending' && (
                <p>Your verification is being reviewed. We'll notify you within 24-48 hours.</p>
              )}
              {existingVerification.status === 'under_review' && (
                <p>Your submission is currently under review by our team.</p>
              )}
              {existingVerification.status === 'rejected' && (
                <div>
                  <p className="text-red-800 font-semibold mb-2">Verification was rejected</p>
                  {existingVerification.rejectionReason && (
                    <p className="text-red-700">{existingVerification.rejectionReason}</p>
                  )}
                </div>
              )}
              {existingVerification.status === 'needs_resubmission' && (
                <p className="text-orange-700">Please resubmit your verification with updated documents.</p>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-3">
            {existingVerification.idFrontImageUrl && (
              <div>
                <Label className="text-xs">ID Front</Label>
                <img 
                  src={existingVerification.idFrontImageUrl} 
                  alt="ID Front" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
            {existingVerification.idBackImageUrl && (
              <div>
                <Label className="text-xs">ID Back</Label>
                <img 
                  src={existingVerification.idBackImageUrl} 
                  alt="ID Back" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
            {existingVerification.selfieImageUrl && (
              <div>
                <Label className="text-xs">Selfie</Label>
                <img 
                  src={existingVerification.selfieImageUrl} 
                  alt="Selfie" 
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div className="text-sm text-slate-600">
            <p>Submitted: {new Date(existingVerification.created_date).toLocaleDateString()}</p>
            {existingVerification.reviewedAt && (
              <p>Reviewed: {new Date(existingVerification.reviewedAt).toLocaleDateString()}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // New verification form
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>Build trust by verifying your identity with a government ID</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <p className="font-semibold mb-1">Why verify?</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Builds trust with donors</li>
                <li>✓ Get a verified badge on your profile</li>
                <li>✓ Increase donation likelihood by 3-4x</li>
                <li>✓ Your info is encrypted and secure</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* ID Type */}
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type *</Label>
            <Select value={formData.idType} onValueChange={(v) => setFormData(prev => ({ ...prev, idType: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {idTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ID Front Photo */}
          <div className="space-y-2">
            <Label>ID Photo (Front) *</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              {formData.idFrontImageUrl ? (
                <div className="relative">
                  <img src={formData.idFrontImageUrl} alt="ID Front" className="max-h-48 mx-auto rounded" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, idFrontImageUrl: "" }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  {uploading.front ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload front of ID</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'front')}
                    className="hidden"
                    disabled={uploading.front}
                  />
                </label>
              )}
            </div>
          </div>

          {/* ID Back Photo (Optional) */}
          <div className="space-y-2">
            <Label>ID Photo (Back) - Optional</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              {formData.idBackImageUrl ? (
                <div className="relative">
                  <img src={formData.idBackImageUrl} alt="ID Back" className="max-h-48 mx-auto rounded" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, idBackImageUrl: "" }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  {uploading.back ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload back of ID</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'back')}
                    className="hidden"
                    disabled={uploading.back}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Selfie with ID */}
          <div className="space-y-2">
            <Label>Selfie Holding ID *</Label>
            <p className="text-xs text-slate-500">Take a selfie holding your ID next to your face</p>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              {formData.selfieImageUrl ? (
                <div className="relative">
                  <img src={formData.selfieImageUrl} alt="Selfie" className="max-h-48 mx-auto rounded" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, selfieImageUrl: "" }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  {uploading.selfie ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to take/upload selfie</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'selfie')}
                    className="hidden"
                    disabled={uploading.selfie}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (as shown on ID) *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Last 4 of Document #</Label>
                <Input
                  id="documentNumber"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your identity documents are encrypted and only reviewed by verified admins. We never share your ID with anyone.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={submitMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            Submit for Verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}