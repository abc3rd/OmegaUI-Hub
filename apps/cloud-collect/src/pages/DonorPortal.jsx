import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Heart, MapPin, History, ArrowRight, Sparkles, ScanLine, Bell } from "lucide-react";

export default function DonorPortal() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['myDonations'],
    queryFn: () => base44.entities.Donation.filter({ donorUserId: user.id }),
    enabled: !!user,
  });

  const { data: recurringDonations = [] } = useQuery({
    queryKey: ['myRecurringDonations'],
    queryFn: () => base44.entities.RecurringDonation.filter({ donorUserId: user.id }),
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !isLoading) {
      if (!user.accountType) {
        navigate(createPageUrl("ChooseAccountType"));
      } else if (user.accountType === 'recipient') {
        navigate(createPageUrl("RecipientPortal"));
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalDonated = donations.reduce((sum, d) => sum + (d.grossAmount || 0), 0);
  const hasDonated = donations.length > 0;
  const activeRecurring = recurringDonations.filter(rd => rd.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Donor Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Welcome, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-lg text-slate-600">
            {hasDonated ? (
              <>
                You've donated ${totalDonated.toFixed(2)} to support others
                {activeRecurring.length > 0 && (
                  <span className="ml-2 text-purple-600 font-semibold">
                    • {activeRecurring.length} recurring donation{activeRecurring.length > 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : "Start making a difference today"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-blue-500" />
                Scan QR Code
              </CardTitle>
              <CardDescription>
                Use your camera to scan a recipient's QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("ScanQR")}>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-[#ea00ea] hover:from-blue-600 hover:to-[#c000c0]">
                  Open Scanner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                Find Recipients
              </CardTitle>
              <CardDescription>
                Browse profiles and resource locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("ResourceMap")}>
                <Button variant="outline" className="w-full">
                  View Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-500" />
                My Donations
              </CardTitle>
              <CardDescription>
                View your donation history and receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("MyDonations")}>
                <Button variant="outline" className="w-full">
                  View History
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Proximity Alerts
              </CardTitle>
              <CardDescription>
                Get notified when you're near someone who needs help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl("DonorProximityAlerts")}>
                <Button variant="outline" className="w-full">
                  Configure Alerts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {activeRecurring.length > 0 && (
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-500" />
                  Recurring Donations
                </CardTitle>
                <CardDescription>
                  Manage your recurring donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl("ManageRecurring")}>
                  <Button variant="outline" className="w-full">
                    Manage Subscriptions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {!hasDonated && (
          <Card className="mt-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-600" />
                Get Started
              </CardTitle>
              <CardDescription>
                Ready to make your first donation?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Cloud QR makes it easy to support individuals in need. Simply scan a QR code or browse profiles to get started.
              </p>
              <div className="flex gap-3">
                <Link to={createPageUrl("ScanQR")} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-[#ea00ea]">
                    Scan QR Code
                  </Button>
                </Link>
                <Link to={createPageUrl("ResourceMap")} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Browse Profiles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}