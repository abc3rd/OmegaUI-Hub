import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    publicName: "",
    story: "",
    goalAmount: "",
    location: "",
  });

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

  const validateForm = () => {
    if (!formData.publicName.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.story.trim()) {
      setError("Please share your story");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in
      const user = await base44.auth.me().catch(() => null);

      if (!user) {
        // Redirect to login
        base44.auth.redirectToLogin(createPageUrl("CreateProfile"));
        return;
      }

      // Create profile
      const profile = await base44.entities.Profile.create({
        publicName: formData.publicName,
        story: formData.story,
        goalAmount: parseFloat(formData.goalAmount) || 0,
        location: formData.location,
        publicProfileUrl: generateSlug(formData.publicName),
        isActive: true,
        totalRaised: 0,
        availableBalance: 0,
        pendingBalance: 0,
        stripeAccountStatus: 'not_started'
      });
      
      // Update user account type to 'recipient'
      await base44.auth.updateMe({ accountType: 'recipient' });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success("Profile created! Let's get your payouts set up.");
      navigate(createPageUrl("Dashboard"));

    } catch (err) {
      console.error("Profile creation error:", err);
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
          Create Your Cloud Collect Profile
        </h1>
        <p className="text-lg text-slate-600">
          Share your story and start receiving support from your community
        </p>
      </div>

      <Card className="border-2 border-slate-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            This information will be visible to people who want to support you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                Your Story <span className="text-blue-500">*</span>
              </Label>
              <Textarea
                id="story"
                placeholder="Share your journey and what you're working toward. People want to know your story and how they can help..."
                value={formData.story}
                onChange={(e) => handleChange("story", e.target.value)}
                className="text-base min-h-[150px]"
                maxLength={500}
              />
              <p className="text-sm text-slate-500">
                {formData.story.length}/500 characters
              </p>
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <Label htmlFor="goalAmount" className="text-base font-semibold">
                Fundraising Goal (Optional)
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
                Set a goal to show your progress (e.g., "$150 for a weekly room rental")
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold">
                General Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="e.g., North Fort Myers, FL"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="text-base h-12"
              />
            </div>

            <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600"/>
                <AlertDescription className="text-amber-800">
                    Payout details will be securely collected on the next step via Stripe.
                </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Your Profile...
                </>
              ) : (
                <>
                  Create My Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}