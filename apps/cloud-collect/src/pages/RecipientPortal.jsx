import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Plus, BarChart3, Settings, ArrowRight, Sparkles } from "lucide-react";

export default function RecipientPortal() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfiles'],
    queryFn: () => base44.entities.Profile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !isLoading) {
      if (!user.accountType) {
        navigate(createPageUrl("ChooseAccountType"));
      } else if (user.accountType === 'donor') {
        navigate(createPageUrl("DonorPortal"));
      }
    }
  }, [user, isLoading, navigate]);

  const hasProfile = profiles.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Recipient Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Welcome, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-lg text-slate-600">
            {hasProfile ? "Manage your profile and track donations" : "Let's get you started with your first profile"}
          </p>
        </div>

        {!hasProfile ? (
          // Onboarding Flow
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl">Create Your Profile</CardTitle>
                <CardDescription className="text-base">
                  Set up your fundraising profile in just a few minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">Share Your Story</h3>
                      <p className="text-sm text-slate-600">Tell people about yourself and your needs</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-purple-600">2</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">Get Your QR Code</h3>
                      <p className="text-sm text-slate-600">Download your unique QR code</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-green-600">3</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">Receive Support</h3>
                      <p className="text-sm text-slate-600">Start accepting donations instantly</p>
                    </div>
                  </div>

                  <Link to={createPageUrl("CreateProfile")}>
                    <Button className="w-full h-16 text-lg bg-gradient-to-r from-blue-500 to-[#ea00ea] hover:from-blue-600 hover:to-[#c000c0]">
                      <Plus className="w-6 h-6 mr-2" />
                      Create My Profile
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Dashboard
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  My Dashboard
                </CardTitle>
                <CardDescription>
                  View your earnings and donation activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl("Dashboard")}>
                  <Button className="w-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-500" />
                  My QR Code
                </CardTitle>
                <CardDescription>
                  Download and manage your QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl("Dashboard")}>
                  <Button variant="outline" className="w-full">
                    View QR Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your story and fundraising goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl("EditProfile")}>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}