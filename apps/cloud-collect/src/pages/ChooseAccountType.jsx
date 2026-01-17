import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, QrCode, ArrowRight, Users, Gift, Building2 } from "lucide-react";

export default function ChooseAccountType() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const setAccountTypeMutation = useMutation({
    mutationFn: async (accountType) => {
      await base44.auth.updateMe({ accountType });
    },
    onSuccess: (_, accountType) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (accountType === 'recipient') {
        navigate(createPageUrl("RecipientPortal"));
      } else if (accountType === 'charitable_entity') {
        navigate(createPageUrl("CharitableEntitySetup"));
      } else {
        navigate(createPageUrl("DonorPortal"));
      }
    }
  });

  useEffect(() => {
    if (user && user.accountType) {
      // Already has account type, redirect to appropriate portal
      if (user.accountType === 'recipient') {
        navigate(createPageUrl("RecipientPortal"));
      } else if (user.accountType === 'charitable_entity') {
        navigate(createPageUrl("CharitableEntityPortal"));
      } else {
        navigate(createPageUrl("DonorPortal"));
      }
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Welcome to <span className="text-gradient">Cloud QR</span>
          </h1>
          <p className="text-lg text-slate-600">
            Choose how you'd like to use Cloud QR
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recipient Card */}
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-[#ea00ea] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">I Need Support</CardTitle>
              <CardDescription className="text-base">
                Create your profile and receive donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <Gift className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Create your personal fundraising profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <QrCode className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Get your unique QR code for donations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Receive direct support from the community</span>
                </li>
              </ul>
              <Button 
                onClick={() => setAccountTypeMutation.mutate('recipient')}
                disabled={setAccountTypeMutation.isPending}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-[#ea00ea] hover:from-blue-600 hover:to-[#c000c0]"
              >
                Continue as Recipient
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Donor Card */}
          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ea00ea] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">I Want to Help</CardTitle>
              <CardDescription className="text-base">
                Support others and track your donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-[#ea00ea] flex-shrink-0 mt-0.5" />
                  <span>Donate to individuals in need</span>
                </li>
                <li className="flex items-start gap-2">
                  <QrCode className="w-5 h-5 text-[#ea00ea] flex-shrink-0 mt-0.5" />
                  <span>Scan QR codes to give instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-5 h-5 text-[#ea00ea] flex-shrink-0 mt-0.5" />
                  <span>Track your donation history</span>
                </li>
              </ul>
              <Button 
                onClick={() => setAccountTypeMutation.mutate('donor')}
                disabled={setAccountTypeMutation.isPending}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#ea00ea] to-blue-500 hover:from-[#c000c0] hover:to-blue-600"
              >
                Continue as Donor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Charitable Entity Card */}
          <Card className="border-2 border-[#4bce2a] hover:border-[#4bce2a] hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4bce2a] to-[#2699fe] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Charitable Entity</CardTitle>
              <CardDescription className="text-base">
                Share resources and events with the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
                  <span>Post your organization's resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-5 h-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
                  <span>Share food drives and events</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-[#4bce2a] flex-shrink-0 mt-0.5" />
                  <span>Help the community find support</span>
                </li>
              </ul>
              <Button 
                onClick={() => setAccountTypeMutation.mutate('charitable_entity')}
                disabled={setAccountTypeMutation.isPending}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#4bce2a] to-[#2699fe] hover:from-green-600 hover:to-blue-600"
              >
                Continue as Organization
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}