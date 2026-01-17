import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, AlertCircle, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getOrCreateProfile, requireAuth } from "@/components/utils/profileHelpers";

export default function CreateProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState(null);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [formData, setFormData] = useState({
    publicName: "",
    story: "",
    goalAmount: "",
    location: "",
    phoneNumber: "",
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!userLoading && !user) {
      toast.error("Please sign in to create your profile");
      base44.auth.redirectToLogin(createPageUrl("CreateProfile"));
    }
  }, [user, userLoading]);

  // Load or create profile on mount
  useEffect(() => {
    async function loadOrCreateProfile() {
      if (!user) return;
      
      try {
        const profile = await getOrCreateProfile();
        if (profile) {
          setExistingProfileId(profile.id);
          setFormData({
            publicName: profile.publicName || "",
            story: profile.story || "",
            goalAmount: profile.goalAmount || "",
            location: profile.location || "",
            phoneNumber: profile.phoneNumber || "",
          });
        }
      } catch (err) {
        console.error("Error loading/creating profile:", err);
        toast.error("Failed to load profile: " + (err.message || "Unknown error"));
      }
    }
    
    loadOrCreateProfile();
  }, [user]);

  const calculateProgress = () => {
    let progress = 0;
    if (formData.publicName.trim()) progress += 30;
    if (formData.story.trim() && formData.story.length >= 50) progress += 30;
    if (formData.goalAmount) progress += 15;
    if (formData.location.trim()) progress += 15;
    if (formData.phoneNumber.trim()) progress += 10;
    return progress;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 8);
  };

  const validateForPublish = () => {
    if (!formData.publicName.trim()) {
      setError("Name is required to publish your profile");
      return false;
    }
    if (!formData.story.trim() || formData.story.length < 50) {
      setError("Story must be at least 50 characters to publish");
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    // Ensure user is authenticated
    const authUser = await requireAuth();
    if (!authUser) return;

    setSavingDraft(true);
    setError(null);

    try {
      // Ensure profile exists
      let profile = await getOrCreateProfile();
      if (!profile) {
        throw new Error("Could not get or create profile");
      }

      const profileData = {
        publicName: formData.publicName.trim() || "Draft Profile",
        story: formData.story.trim() || "",
        goalAmount: parseFloat(formData.goalAmount) || 0,
        location: formData.location?.trim() || "",
        phoneNumber: formData.phoneNumber?.trim() || "",
        isDraft: true,
        isActive: false,
        completionPercentage: calculateProgress(),
      };

      await base44.entities.Profile.update(profile.id, profileData);
      setExistingProfileId(profile.id);
      toast.success("Draft saved successfully!");

      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err) {
      console.error("Save draft error:", err);
      const errorMsg = err.message || err.toString() || "Failed to save draft";
      toast.error("Error: " + errorMsg);
      setError(errorMsg);
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!validateForPublish()) return;

    // Ensure user is authenticated
    const authUser = await requireAuth();
    if (!authUser) return;

    setLoading(true);
    setError(null);

    try {
      // Ensure profile exists
      let profile = await getOrCreateProfile();
      if (!profile) {
        throw new Error("Could not get or create profile");
      }

      const profileData = {
        publicName: formData.publicName.trim(),
        story: formData.story.trim(),
        goalAmount: parseFloat(formData.goalAmount) || 0,
        location: formData.location?.trim() || "",
        phoneNumber: formData.phoneNumber?.trim() || "",
        isDraft: false,
        isActive: true,
        completionPercentage: 100,
        verificationStatus: 'unverified',
        verificationBadges: [],
        enableProximityAlerts: false
      };

      // Update existing profile
      profile = await base44.entities.Profile.update(profile.id, profileData);

      // Sync to Google Sheets
      try {
        await base44.functions.invoke('syncToGoogleSheets', {
          type: 'profile',
          data: { ...profile, created_by: user.email }
        });
      } catch (sheetError) {
        console.warn('Google Sheets sync failed:', sheetError);
      }

      // Update user account type
      await base44.auth.updateMe({ accountType: 'recipient' });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success("Profile published! Setting up your payouts...");
      navigate(createPageUrl("Dashboard"));

    } catch (err) {
      console.error("Publish error:", err);
      const errorMsg = err.message || err.toString() || "Failed to publish profile. Please try again.";
      setError(errorMsg);
      toast.error("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const progress = calculateProgress();
  const isReadyToPublish = progress >= 60;

  // Show loading while checking auth
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
          {existingProfileId ? "Edit Your Profile" : "Create Your Digital Cup Profile"}
        </h1>
        <p className="text-lg text-slate-600">
          Tell your journey and connect with your community responsibly
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Profile Completion</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-slate-600">
              {progress < 60 
                ? "Complete at least 60% to publish and start receiving donations" 
                : "✓ Ready to publish! You can still add more details."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-slate-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            This information will be visible to people who want to support you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handlePublish} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Public Name */}
            <div className="space-y-2">
              <Label htmlFor="publicName" className="text-base font-semibold">
                Your Name <span className="text-blue-500">*</span>
              </Label>
              <Input
                id="publicName"
                placeholder="What should people call you?"
                value={formData.publicName}
                onChange={(e) => handleChange("publicName", e.target.value)}
                className="text-base h-12"
                maxLength={50}
              />
              <p className="text-sm text-slate-500">
                This is the name that will appear on your public profile
              </p>
            </div>

            {/* Story */}
            <div className="space-y-2">
              <Label htmlFor="story" className="text-base font-semibold">
                Your Journey <span className="text-blue-500">*</span>
              </Label>
              <Textarea
                id="story"
                placeholder="Tell your journey. Share who you are and what you are working toward. Dignity begins with being heard..."
                value={formData.story}
                onChange={(e) => handleChange("story", e.target.value)}
                className="text-base min-h-[150px]"
                maxLength={500}
              />
              <p className="text-sm text-slate-500">
                {formData.story.length}/500 characters {formData.story.length < 50 && "(minimum 50 for publishing)"}
              </p>
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <Label htmlFor="goalAmount" className="text-base font-semibold">
                Fundraising Goal
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                <Input
                  id="goalAmount"
                  type="number"
                  placeholder="0"
                  value={formData.goalAmount}
                  onChange={(e) => handleChange("goalAmount", e.target.value)}
                  className="text-base h-12 pl-8"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-sm text-slate-500">
                Set a goal to show your progress (e.g., "$150 for weekly room rental")
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold">
                General Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., North Fort Myers, FL"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="text-base h-12"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="text-base h-12"
              />
              <p className="text-sm text-slate-500">
                Optional - visible only to you and admins
              </p>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600"/>
              <AlertDescription className="text-amber-800">
                Payout details will be securely collected on the next step via Stripe.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={savingDraft || loading}
                className="flex-1 h-14 text-base"
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                type="submit"
                disabled={loading || savingDraft || !isReadyToPublish}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Publish Profile
                  </>
                )}
              </Button>
            </div>

            {!isReadyToPublish && (
              <p className="text-sm text-center text-amber-600">
                Complete at least 60% of your profile to publish
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}