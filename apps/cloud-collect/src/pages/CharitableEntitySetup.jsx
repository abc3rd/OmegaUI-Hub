import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CharitableEntitySetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "church",
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organizationName.trim()) {
      toast.error("Please enter your organization name");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
      });
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Organization profile created!");
      navigate(createPageUrl("CharitableEntityPortal"));
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-[#4bce2a]">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4bce2a] to-[#2699fe] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl">Setup Your Organization</CardTitle>
          <CardDescription className="text-base">
            Tell us about your charitable organization so the community can find your resources and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-base font-semibold">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="organizationName"
                placeholder="e.g., Grace Bible Church, Hope Food Bank"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType" className="text-base font-semibold">
                Organization Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="church">Church</SelectItem>
                  <SelectItem value="food_bank">Food Bank</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="community_center">Community Center</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What You Can Do:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc ml-4">
                <li>Post resources directly to the Resource Map</li>
                <li>Share recurring events (e.g., "Food Giveaway Every Tuesday at 2 PM")</li>
                <li>Help community members find essential services</li>
                <li>Update your information in real-time</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-[#4bce2a] to-[#2699fe] hover:from-green-600 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}